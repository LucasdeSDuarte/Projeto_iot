import { useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import {
  CognitoIdentityClient
} from '@aws-sdk/client-cognito-identity';
import {
  fromCognitoIdentityPool
} from '@aws-sdk/credential-provider-cognito-identity';
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";

const REGION = "sa-east-1";
const IDENTITY_POOL_ID = "sa-east-1:91d7bc01-4213-4e36-9625-e1bdf99f2105";
const IOT_ENDPOINT = "apmd68u6lkwr4-ats.iot.sa-east-1.amazonaws.com";

export default function useMQTT(topics = [], onMessage, onStatusChange = () => {}) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!topics.length) return;

    let client;

    const connectToMqtt = async () => {
      try {
        const credentials = await fromCognitoIdentityPool({
            client: new CognitoIdentityClient({ region: REGION }),
            identityPoolId: IDENTITY_POOL_ID,
            })();

            const signer = new SignatureV4({
            service: "iotdevicegateway",
            region: REGION,
            credentials,
            sha256: Sha256,
            });

            const request = {
            method: "GET",
            protocol: "wss:",
            hostname: IOT_ENDPOINT,
            path: "/mqtt",
            headers: {
                host: IOT_ENDPOINT,
            },
            };

            const signed = await signer.presign(request);
            const url = `${signed.protocol}//${signed.hostname}${signed.path}?${new URLSearchParams(signed.query).toString()}`;

            client = mqtt.connect(url, {
            clientId: `frontend-${Math.random().toString(16).slice(2, 10)}`,
            protocol: "wss",
            clean: true,
            reconnectPeriod: 1000,
            });

        clientRef.current = client;

        client.on('connect', () => {
          onStatusChange("connected");
          topics.forEach(topic => client.subscribe(topic));
        });

        client.on('message', (topic, message) => {
          try {
            const payload = JSON.parse(message.toString());
            onMessage(topic, payload);
          } catch (error) {
            console.error("Erro ao interpretar mensagem MQTT:", error);
          }
        });

        client.on('error', (err) => {
          onStatusChange("error");
          console.error("Erro na conexão MQTT:", err);
        });

        client.on('close', () => {
          onStatusChange("disconnected");
        });
      } catch (error) {
        console.error("Erro na autenticação MQTT Cognito:", error);
        onStatusChange("error");
      }
    };

    connectToMqtt();

    return () => {
      if (clientRef.current) {
        topics.forEach(topic => clientRef.current.unsubscribe(topic));
        clientRef.current.end();
      }
    };
  }, [topics]);
}
