import { CognitoIdentityClient, GetIdCommand } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import { HttpRequest } from "@aws-sdk/protocol-http";
import mqtt from "mqtt";

const REGION = "sa-east-1";
const IDENTITY_POOL_ID = import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || "sa-east-1:91d7bc01-4213-4e36-9625-e1bdf99f2105";
const IOT_HOST = "apmd68u6lkwr4-ats.iot.sa-east-1.amazonaws.com";
const MQTT_PATH = "/mqtt";

let mqttClient = null;
let messageHandler = null;
let reconnectTimer = null;
let renewCredentialsTimer = null;
let activeSubscriptions = [];

/**
 * Obtém credenciais do Cognito Identity Pool
 */
async function getAwsCredentials() {
  try {
    console.log("[Cognito] Usando Identity Pool:", IDENTITY_POOL_ID);
    const cognitoClient = new CognitoIdentityClient({ region: REGION });
    const getIdResp = await cognitoClient.send(
      new GetIdCommand({ IdentityPoolId: IDENTITY_POOL_ID })
    );
    console.log("[Cognito] IdentityId obtido:", getIdResp.IdentityId);
    const creds = await fromCognitoIdentityPool({
      client: cognitoClient,
      identityPoolId: IDENTITY_POOL_ID
    })();
    console.log("[Cognito] Credenciais:", {
      accessKeyId: creds.accessKeyId,
      secretKey: creds.secretAccessKey?.slice(0,4) + "…",
      sessionToken: creds.sessionToken?.slice(0,10) + "…"
    });
    return creds;
  } catch (error) {
    console.error("[Cognito] Erro ao obter credenciais:", error);
    throw error;
  }
}

/**
 * Cria uma URL pré-assinada para WebSocket MQTT
 */
async function createPresignedUrl(creds) {
  try {
    const signer = new SignatureV4({
      credentials: creds,
      region: REGION,
      service: "iotdevicegateway",
      sha256: Sha256,
    });
    
    const request = new HttpRequest({
      protocol: "wss:",
      hostname: IOT_HOST,
      port: 443,
      method: "GET",
      path: MQTT_PATH,
      query: {},
      headers: { host: IOT_HOST },
    });

    const signed = await signer.presign(request, { expiresIn: 300 });
    return `${signed.protocol}//${signed.hostname}${signed.path}?${new URLSearchParams(signed.query).toString()}`;
  } catch (error) {
    console.error("[MQTT] Erro ao criar URL presignada:", error);
    throw error;
  }
}

/**
 * Agenda a renovação de credenciais antes que expirem
 */
function scheduleCredentialRenewal() {
  // Limpar timer existente se houver
  if (renewCredentialsTimer) {
    clearTimeout(renewCredentialsTimer);
  }
  
  // Renovar a cada 4 minutos (credenciais expiram em 5 minutos)
  renewCredentialsTimer = setTimeout(async () => {
    console.log("[MQTT] Renovando credenciais...");
    // Desconectar e reconectar com novas credenciais
    if (mqttClient) {
      mqttClient.end(true, () => {
        mqttClient = null;
        // Reconectar com novas credenciais e reinscrever nos tópicos
        conectarMQTT(messageHandler).then(() => {
          if (activeSubscriptions.length > 0) {
            inscreverTopicos(activeSubscriptions);
          }
        });
      });
    }
  }, 4 * 60 * 1000); // 4 minutos em milissegundos
}

/**
 * Conecta via WebSocket MQTT com URL SigV4
 */
export async function conectarMQTT(onMessage) {
  // Armazenar o manipulador de mensagens para reutilizar durante reconexões
  if (onMessage) {
    messageHandler = onMessage;
  }

  // Se já estiver conectado, apenas retornar o cliente
  if (mqttClient && mqttClient.connected) {
    return mqttClient;
  }

  // Limpar timer de reconexão se existir
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  try {
    const creds = await getAwsCredentials();
    const clientId = `frontend-${Date.now()}`;
    const url = await createPresignedUrl(creds);
    console.log("[MQTT] URL presignada:", url);

    // Configurar cliente MQTT com opções robustas
    mqttClient = mqtt.connect(url, {
      clientId,
      keepalive: 30, // reduzido para detectar desconexões mais rapidamente
      reconnectPeriod: 3000, // tentar reconectar a cada 3 segundos
      connectTimeout: 10000, // timeout de conexão de 10 segundos
      clean: true
    });

    mqttClient.on("connect", () => {
      console.log(`✅ MQTT conectado (${clientId})`);
      // Agendar renovação de credenciais
      scheduleCredentialRenewal();
      
      // Reinscrever nos tópicos ativos quando reconectar
      if (activeSubscriptions.length > 0) {
        inscreverTopicos(activeSubscriptions);
      }
    });

    mqttClient.on("message", (topic, payload) => {
      try {
        const message = JSON.parse(payload.toString());
        if (messageHandler) {
          messageHandler(topic, message);
        }
      } catch (err) {
        console.error("❌ Erro ao interpretar payload:", err);
      }
    });

    mqttClient.on("error", err => {
      console.error("❌ MQTT error:", err);
    });

    mqttClient.on("close", () => {
      console.log("⚠️ MQTT close");
    });

    mqttClient.on("reconnect", () => {
      console.log("🔄 MQTT tentando reconectar...");
    });

    mqttClient.on("offline", () => {
      console.log("⚠️ MQTT offline");
      // Se ficar offline por mais de 10 segundos, tentar reconectar com novas credenciais
      reconnectTimer = setTimeout(() => {
        console.log("🔄 MQTT reconexão forçada com novas credenciais");
        if (mqttClient) {
          mqttClient.end(true, () => {
            mqttClient = null;
            conectarMQTT(messageHandler);
          });
        }
      }, 10000);
    });

    return mqttClient;
  } catch (error) {
    console.error("❌ Falha na conexão MQTT:", error);
    // Tentar novamente após um tempo
    reconnectTimer = setTimeout(() => {
      console.log("🔄 Tentando reconectar MQTT após falha...");
      conectarMQTT(messageHandler);
    }, 5000);
    return null;
  }
}

/**
 * Inscreve nos tópicos MQTT
 */
export function inscreverTopicos(topics = []) {
  if (!mqttClient || !mqttClient.connected) {
    console.warn("⚠️ MQTT não conectado. Tentando conectar primeiro...");
    conectarMQTT(messageHandler).then(client => {
      if (client) {
        _subscribeToTopics(topics);
      }
    });
    return;
  }
  
  _subscribeToTopics(topics);
}

/**
 * Função interna para inscrição em tópicos
 */
function _subscribeToTopics(topics) {
  topics.forEach(topic => {
    mqttClient.subscribe(topic, { qos: 0 }, (err) => {
      if (err) {
        console.error(`❌ Falha ao inscrever em ${topic}:`, err);
      } else {
        console.log(`✅ Inscrito em ${topic}`);
        // Adicionar à lista de inscrições ativas se não estiver já
        if (!activeSubscriptions.includes(topic)) {
          activeSubscriptions.push(topic);
        }
      }
    });
  });
}

/**
 * Cancela inscrição nos tópicos
 */
export function unsubscribeTopics(topics = []) {
  if (!mqttClient || !mqttClient.connected) {
    console.warn("⚠️ MQTT não conectado, não é possível cancelar inscrições");
    return;
  }
  
  mqttClient.unsubscribe(topics, err => {
    if (err) {
      console.error("❌ Erro ao cancelar inscrição:", err);
    } else {
      console.log("✅ Inscrição cancelada em", topics);
      // Remover da lista de inscrições ativas
      activeSubscriptions = activeSubscriptions.filter(t => !topics.includes(t));
    }
  });
}

/**
 * Publica uma mensagem em um tópico
 */
export function publicarMensagem(topic, message) {
  if (!mqttClient || !mqttClient.connected) {
    console.warn("⚠️ MQTT não conectado. Tentando conectar primeiro...");
    return conectarMQTT(messageHandler).then(client => {
      if (client) {
        return _publishMessage(topic, message);
      }
      return false;
    });
  }
  
  return _publishMessage(topic, message);
}

/**
 * Função interna para publicar mensagem
 */
function _publishMessage(topic, message) {
  return new Promise((resolve, reject) => {
    mqttClient.publish(
      topic, 
      typeof message === 'string' ? message : JSON.stringify(message),
      { qos: 0 },
      (err) => {
        if (err) {
          console.error(`❌ Erro ao publicar em ${topic}:`, err);
          reject(err);
        } else {
          console.log(`✅ Mensagem publicada em ${topic}`);
          resolve(true);
        }
      }
    );
  });
}

/**
 * Desconecta o cliente MQTT
 */
export function desconectarMQTT() {
  // Limpar timers
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  if (renewCredentialsTimer) {
    clearTimeout(renewCredentialsTimer);
    renewCredentialsTimer = null;
  }
  
  // Limpar lista de inscrições
  activeSubscriptions = [];
  
  // Desconectar cliente
  if (mqttClient) {
    mqttClient.end(true, () => {
      console.log("🛑 MQTT desconectado");
      mqttClient = null;
    });
  }
}