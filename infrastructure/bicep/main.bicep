param location string
param solution string
param project string
param imageName string
param imageTag string

var devSuffix = 'dev'
var prodSuffix = 'prod'
var containerRegistryName = '${solution}acr'
var keyVaultName = '${solution}-key-vault'
var keyVaultSecretName = '${containerRegistryName}AdminPassword'

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2021-06-01-preview' = {
  name: containerRegistryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
    networkRuleBypassOptions: 'AzureServices'
    zoneRedundancy: 'Disabled'
    anonymousPullEnabled: false
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enableRbacAuthorization: true
    enabledForDiskEncryption: true
    tenantId: tenant().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
  }
}

resource keyVaultSecret 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {
  name: keyVaultSecretName
  parent: keyVault
  properties: {
    value: containerRegistry.listCredentials().passwords[0].value
  }
}

resource devLogAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2020-10-01' = {
  name: '${solution}-${project}-${devSuffix}-la-workspace'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource devContainerAppEnvironment 'Microsoft.App/managedEnvironments@2022-06-01-preview' = {
  name: '${solution}-${project}-${devSuffix}-environment'
  location: location
  sku: {
    name: 'Consumption'
  }
  properties: {
    zoneRedundant: false
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: devLogAnalyticsWorkspace.properties.customerId
        sharedKey: devLogAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
  }
}

resource devContainerApp 'Microsoft.App/containerApps@2022-06-01-preview' = {
  name: '${solution}-${project}-${devSuffix}-ca'
  location: location
  identity: {
    type: 'None'
  }
  properties: {
    environmentId: devContainerAppEnvironment.id
    managedEnvironmentId: devContainerAppEnvironment.id
    configuration: {
      secrets: [
        {
          name: '${containerRegistryName}-password'
          value: containerRegistry.listCredentials().passwords[0].value
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
        targetPort: 80
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
        appPort: 80
        appId: '${solution}-${project}-${devSuffix}-container'
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
          name: '${solution}-${project}-${devSuffix}-container'
          env: [
            {
              name: 'PORT'
              value: '80'
            }
            {
              name: 'googleClientID'
              value: '450487781777-dqqg7ep8rtol5vmb47riauiv8mllrb03.apps.googleusercontent.com'
            }
            {
              name: 'googleClientSecret'
              value: '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'
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

resource prodLogAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2020-10-01' = {
  name: '${solution}-${project}-${prodSuffix}-la-workspace'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource prodContainerAppEnvironment 'Microsoft.App/managedEnvironments@2022-06-01-preview' = {
  name: '${solution}-${project}-${prodSuffix}-environment'
  location: location
  sku: {
    name: 'Consumption'
  }
  properties: {
    zoneRedundant: false
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: prodLogAnalyticsWorkspace.properties.customerId
        sharedKey: prodLogAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
  }
}

resource prodContainerApp 'Microsoft.App/containerApps@2022-06-01-preview' = {
  name: '${solution}-${project}-${prodSuffix}-ca'
  location: location
  identity: {
    type: 'None'
  }
  properties: {
    environmentId: prodContainerAppEnvironment.id
    managedEnvironmentId: prodContainerAppEnvironment.id
    configuration: {
      secrets: [
        {
          name: '${containerRegistryName}-password'
          value: containerRegistry.listCredentials().passwords[0].value
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
        targetPort: 80
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
        appPort: 80
        appId: '${solution}-${project}-${prodSuffix}-container'
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
          name: '${solution}-${project}-${prodSuffix}-container'
          env: [
            {
              name: 'PORT'
              value: '80'
            }
            {
              name: 'googleClientID'
              value: '450487781777-dqqg7ep8rtol5vmb47riauiv8mllrb03.apps.googleusercontent.com'
            }
            {
              name: 'googleClientSecret'
              value: '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'
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

output DevContainerAppUrl string = devContainerApp.properties.configuration.ingress.fqdn
output ProdContainerAppUrl string = prodContainerApp.properties.configuration.ingress.fqdn
