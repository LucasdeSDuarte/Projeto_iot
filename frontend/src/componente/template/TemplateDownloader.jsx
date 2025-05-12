import React from 'react';
import { saveAs } from 'file-saver';

export default function TemplateDownloader({ tipoSensor, clienteId, torreId, sensorTipo }) {
  const gerarCodigo = () => {
    let template = '';

    if (tipoSensor === 'vibracao') {
      template = `#include <WiFi.h>
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
    } else {
      template = `#include <WiFi.h>
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
    }

    const blob = new Blob([template], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `esp32-${sensorTipo}-${clienteId}-torre${torreId}.ino`);
  };

  return (
    <button
      onClick={gerarCodigo}
      className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
    >
      📥 Baixar Código ESP32
    </button>
  );
}
