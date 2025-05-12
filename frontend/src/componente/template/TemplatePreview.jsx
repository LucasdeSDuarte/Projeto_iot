import React, { useState, useEffect } from 'react';

export default function TemplatePreview({ tipoSensor, clienteId, torreId, sensorTipo, copiar }) {
  // Estado para controlar o tipo de template exibido (caso queira alternar manualmente)
  const [templateSelecionado, setTemplateSelecionado] = useState(tipoSensor);
  
  // Atualizar o template selecionado sempre que o tipoSensor mudar
  useEffect(() => {
    setTemplateSelecionado(tipoSensor);
  }, [tipoSensor]);

  // Função para determinar se é um sensor de temperatura baseado no tipo
  const isTemperaturaTemplate = (tipo) => {
    const tiposTemperatura = ['temperatura', 'temp', 'ds18b20'];
    return tiposTemperatura.includes(tipo?.toLowerCase());
  };

  // Função para determinar se é um sensor de vibração baseado no tipo
  const isVibracaoTemplate = (tipo) => {
    const tiposVibracao = ['vibracao', 'vib', 'mpu6050', 'acelerometro'];
    return tiposVibracao.includes(tipo?.toLowerCase());
  };

  // Automaticamente determinar o template baseado no tipo
  const getTemplateAutomatico = () => {
    if (isTemperaturaTemplate(sensorTipo)) {
      return getTemperaturaTemplate();
    } else if (isVibracaoTemplate(sensorTipo)) {
      return getVibracaoTemplate();
    } else {
      // Se não conseguir determinar, usar o selecionado manualmente ou padrão vibração
      return templateSelecionado === 'temperatura' ? getTemperaturaTemplate() : getVibracaoTemplate();
    }
  };

  // Template para sensor de vibração
  const getVibracaoTemplate = () => {
    return `#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <math.h>

const char* ssid = "SEU_WIFI";
const char* password = "SUA_SENHA";
const char* aws_endpoint = "apmd68u6lkwr4-ats.iot.sa-east-1.amazonaws.com";
const char* mqtt_topic = "torres/cliente${clienteId}/torre${torreId}/${sensorTipo}";

const char* root_ca = R"(-----BEGIN CERTIFICATE-----
COLE_AQUI_ROOT_CA
-----END CERTIFICATE-----)";

const char* device_cert = R"(-----BEGIN CERTIFICATE-----
COLE_AQUI_CERTIFICADO_DO_DISPOSITIVO
-----END CERTIFICATE-----)";

const char* private_key = R"(-----BEGIN RSA PRIVATE KEY-----
COLE_AQUI_CHAVE_PRIVADA
-----END RSA PRIVATE KEY-----)";

Adafruit_MPU6050 mpu;
WiFiClientSecure espClient;
PubSubClient client(espClient);

void conectarWiFi() {
  Serial.print("Conectando ao Wi-Fi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" conectado!");
}

void conectarAWS() {
  espClient.setCACert(root_ca);
  espClient.setCertificate(device_cert);
  espClient.setPrivateKey(private_key);
  client.setServer(aws_endpoint, 8883);
  Serial.print("Conectando ao AWS IoT Core...");
  while (!client.connect("ESP32_MPU6050")) {
    Serial.print(".");
    delay(500);
  }
  Serial.println(" conectado!");
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!mpu.begin()) {
    Serial.println("Erro ao iniciar MPU6050!");
    while (1);
  }
  conectarWiFi();
  conectarAWS();
}

void loop() {
  if (!client.connected()) {
    conectarAWS();
  }
  client.loop();

  sensors_event_t a, g, t;
  mpu.getEvent(&a, &g, &t);
  float vibracao = sqrt(a.acceleration.x * a.acceleration.x + a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z);

  char payload[256];
  snprintf(payload, sizeof(payload),
    "{\"cliente_id\":\"cliente${clienteId}\",\"torre_id\":\"torre${torreId}\",\"sensor_tipo\":\"${sensorTipo}\",\"valor\":%.2f,\"timestamp\":%lu}",
    vibracao, millis()/1000);

  client.publish(mqtt_topic, payload);
  delay(30000);
}`;
  };

  // Template para sensor de temperatura
  const getTemperaturaTemplate = () => {
    return `#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

const char* ssid = "SEU_WIFI";
const char* password = "SUA_SENHA";
const char* aws_endpoint = "apmd68u6lkwr4-ats.iot.sa-east-1.amazonaws.com";
const char* mqtt_topic = "torres/cliente${clienteId}/torre${torreId}/${sensorTipo}";

const char* root_ca = R"(-----BEGIN CERTIFICATE-----
COLE_AQUI_ROOT_CA
-----END CERTIFICATE-----)";

const char* device_cert = R"(-----BEGIN CERTIFICATE-----
COLE_AQUI_CERTIFICADO_DO_DISPOSITIVO
-----END CERTIFICATE-----)";

const char* private_key = R"(-----BEGIN RSA PRIVATE KEY-----
COLE_AQUI_CHAVE_PRIVADA
-----END RSA PRIVATE KEY-----)";

#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensores(&oneWire);
WiFiClientSecure espClient;
PubSubClient client(espClient);

void conectarWiFi() {
  Serial.print("Conectando Wi-Fi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" conectado!");
}

void conectarAWS() {
  espClient.setCACert(root_ca);
  espClient.setCertificate(device_cert);
  espClient.setPrivateKey(private_key);
  client.setServer(aws_endpoint, 8883);
  Serial.print("Conectando AWS IoT Core...");
  while (!client.connect("ESP32_DS18B20")) {
    Serial.print(".");
    delay(500);
  }
  Serial.println(" conectado!");
}

void setup() {
  Serial.begin(115200);
  sensores.begin();
  conectarWiFi();
  conectarAWS();
}

void loop() {
  if (!client.connected()) {
    conectarAWS();
  }
  client.loop();
  sensores.requestTemperatures();
  float tempC = sensores.getTempCByIndex(0);

  char payload[256];
  snprintf(payload, sizeof(payload),
    "{\"cliente_id\":\"cliente${clienteId}\",\"torre_id\":\"torre${torreId}\",\"sensor_tipo\":\"${sensorTipo}\",\"valor\":%.2f,\"timestamp\":%lu}",
    tempC, millis()/1000);

  client.publish(mqtt_topic, payload);
  delay(30000);
}`;
  };

  // Obter o código do template correto
  const codigo = getTemplateAutomatico();

  // Determinar o tipo de sensor para exibição
  const tipoSensorExibicao = isTemperaturaTemplate(sensorTipo) ? 'temperatura' : 
                             isVibracaoTemplate(sensorTipo) ? 'vibração' : 
                             templateSelecionado;

  // Identificar o hardware usado na descrição
  const hardwareDescricao = isTemperaturaTemplate(sensorTipo) ? 'DS18B20' : 
                           isVibracaoTemplate(sensorTipo) ? 'MPU6050' : 
                           templateSelecionado === 'temperatura' ? 'DS18B20' : 'MPU6050';

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="font-semibold text-gray-800 dark:text-white">
          📄 Código ESP32 para sensor de {tipoSensorExibicao} ({hardwareDescricao}):
        </label>
        
        {/* Toggle para alternar manualmente entre templates */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Tipo:</span>
          <div className="flex border border-gray-300 dark:border-gray-600 rounded">
            <button
              onClick={() => setTemplateSelecionado('vibracao')}
              className={`px-3 py-1 text-xs rounded-l ${
                !isTemperaturaTemplate(templateSelecionado) 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Vibração
            </button>
            <button
              onClick={() => setTemplateSelecionado('temperatura')}
              className={`px-3 py-1 text-xs rounded-r ${
                isTemperaturaTemplate(templateSelecionado)
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Temperatura
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <textarea
          readOnly
          value={codigo}
          rows={30}
          className="w-full p-4 bg-gray-100 dark:bg-zinc-800 rounded font-mono text-xs text-gray-900 dark:text-white"
        />
        <button
          onClick={() => copiar(codigo)}
          className="absolute top-2 right-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          📋 Copiar Código
        </button>
      </div>
    </div>
  );
}