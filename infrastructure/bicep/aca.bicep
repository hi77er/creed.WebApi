param location string
param env string
param solution string
param project string
param imageName string
param imageTag string
param containerRegistryName string
@secure()
param containerRegistryPassword string
param envPort int
param envMongoDbConnectionString string
param envGoogleClientId string
@secure()
param envGoogleClientSecret string
@secure()
param envCookieKey string

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2020-10-01' = {
  name: '${solution}-${project}-${env}-la-workspace'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2022-06-01-preview' = {
  name: '${solution}-${project}-${env}-environment'
  location: location
  sku: {
    name: 'Consumption'
  }
  properties: {
    zoneRedundant: false
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
  }
}

resource containerApp 'Microsoft.App/containerApps@2022-06-01-preview' = {
  name: '${solution}-${project}-${env}-ca'
  location: location
  identity: {
    type: 'None'
  }
  properties: {
    environmentId: containerAppEnvironment.id
    managedEnvironmentId: containerAppEnvironment.id
    configuration: {
      secrets: [
        {
          name: '${containerRegistryName}-password'
          value: containerRegistryPassword
        }
      ]
      registries: [
        {
          server: '${containerRegistryName}.azurecr.io'
          username: containerRegistryName
          passwordSecretRef: '${containerRegistryName}-password'
        }
      ]
      ingress: {
        external: true
        targetPort: envPort
        exposedPort: 0
        transport: 'Auto'
        traffic: [
          {
            weight: 100
            latestRevision: true
          }
        ]
        allowInsecure: false
      }
      dapr: {
        enabled: true
        appPort: envPort
        appId: '${solution}-${project}-${env}-container'
        appProtocol: 'http'
        enableApiLogging: false
        logLevel: 'error'
      }
      activeRevisionsMode: 'Single'
      maxInactiveRevisions: 1
    }
    template: {
      revisionSuffix: 'revision'
      containers: [
        {
          image: '${imageName}:${imageTag}'
          name: '${solution}-${project}-${env}-container'
          env: [
            {
              name: 'PORT'
              value: string(envPort)
            }
            {
              name: 'MONGO_DB_CONNECTION_STRING'
              value: envMongoDbConnectionString
            }
            {
              name: 'GOOGLE_CLIENT_ID'
              value: envGoogleClientId
            }
            {
              name: 'GOOGLE_CLIENT_SECRET'
              value: envGoogleClientSecret
            }
            {
              name: 'COOKIE_KEY'
              value: envCookieKey
            }
          ]
          resources: {
            cpu: '0.25'
            memory: '0.5Gi'
          }
          probes: []
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
      }
    }
  }
}

output ContainerAppUrl string = containerApp.properties.configuration.ingress.fqdn
