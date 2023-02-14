param solution string
param project string
param env string
param location string
param containerAppEnvironmentId string
param containerRegistryName string
@secure()
param containerRegistryPassword string
param imageName string
param imageTag string
param envVariables array

resource containerApp 'Microsoft.App/containerApps@2022-06-01-preview' = {
  name: '${solution}-${project}-${env}-ca'
  location: location
  identity: {
    type: 'None'
  }
  properties: {
    environmentId: containerAppEnvironmentId
    managedEnvironmentId: containerAppEnvironmentId
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
        targetPort: envVariables[0].value
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
        appPort: envVariables[0].value
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
          env: envVariables
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
