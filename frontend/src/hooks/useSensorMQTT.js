// src/hooks/useSensorMQTT.js

import { useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";

const REGION = "sa-east-1";
const IDENTITY_POOL_ID = "sa-east-1:91d7bc01-4213-4e36-9625-e1bdf99f2105";
const IOT_ENDPOINT = "apmd68u6lkwr4-ats.iot.sa-east-1.amazonaws.com";

export default function useSensorMQTT(
  filters,
  onMessage,
  onStatusChange
) {
  const clientRef = useRef(null);

  const makeTopic = () => {
    const { cliente, torre, sensor } = filters || {};
    if (cliente && torre && sensor) return `torres/${cliente}/${torre}/${sensor}`;
    if (cliente && torre)           return `torres/${cliente}/${torre}/#`;
    if (cliente)                    return `torres/${cliente}/#`;
    return `torres/+/+/+`;
  };

  useEffect(() => {
    onStatusChange && onStatusChange('connecting');

    (async () => {
      try {

        const creds = await fromCognitoIdentityPool({
          client: new CognitoIdentityClient({ region: REGION }),
          identityPoolId: IDENTITY_POOL_ID,
        })();

        const signer = new SignatureV4({
          service: "iotdevicegateway",
          region: REGION,
          credentials: creds,
          sha256: Sha256,
        });

        const request = {
          method:   "GET",
          protocol: "wss:",
          hostname: IOT_ENDPOINT,
          path:     "/mqtt",
          headers:  { host: IOT_ENDPOINT },
        };

        const signed = await signer.presign(request);
        const url = `wss://${signed.hostname}${signed.path}?${new URLSearchParams(signed.query).toString()}`;

        const client = mqtt.connect(url, {
          clientId: `react_${Math.random().toString(16).slice(2,8)}`,
          clean: true,
          reconnectPeriod: 2000,
        });

        clientRef.current = client;

        client.on('connect', ()    => onStatusChange && onStatusChange('connected'));
        client.on('close', ()      => onStatusChange && onStatusChange('disconnected'));
        client.on('error', err => {
          console.error("MQTT Error:", err);
          onStatusChange && onStatusChange('error');
        });
        client.on('message', (topic, msg) => {
          let payload = null;
          try {
            payload = JSON.parse(msg.toString());
          } catch (e) {
            console.error("JSON parse error:", e);
          }
          onMessage && onMessage(topic, payload);
        });

      } catch (e) {
        console.error("MQTT auth error:", e);
        onStatusChange && onStatusChange('error');
      }
    })();

    return () => {
      if (clientRef.current) {
        clientRef.current.end();
      }
    };
  }, []);

  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    const topic = makeTopic();
    
    client.unsubscribe('#', () => {
      client.subscribe(topic, { qos: 0 }, err => {
        if (err) console.error("Subscribe error:", err);
      });
    });

    return () => {
      client.unsubscribe(topic);
    };
  }, [filters.cliente, filters.torre, filters.sensor]);
}
