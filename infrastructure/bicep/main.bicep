param location string
param solution string
param project string
param imageName string
param imageTag string
param spPolicyAppId string
param spPolicyObjectId string
param spPolicyTenantId string

module core 'core.bicep' = {
  name: 'core'
  params: {
    location: location
    solution: solution
    spPolicyAppId: spPolicyAppId
    spPolicyObjectId: spPolicyObjectId
    spPolicyTenantId: spPolicyTenantId
  }
}

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
    tenantId: spPolicyTenantId
    accessPolicies: [
      {
        applicationId: spPolicyAppId
        objectId: spPolicyObjectId
        tenantId: spPolicyTenantId
        permissions: {
          secrets: [ 'all' ]
        }
      }
    ]
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

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2020-10-01' = {
  name: '${solution}-${project}-${'dev'}-la-workspace'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2022-06-01-preview' = {
  name: '${solution}-${project}-${'dev'}-environment'
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
  name: '${solution}-${project}-${'dev'}-ca'
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
        appId: '${solution}-${project}-${'dev'}-container'
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
          name: '${solution}-${project}-${'dev'}-container'
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
  name: '${solution}-${project}-${'prod'}-la-workspace'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource prodContainerAppEnvironment 'Microsoft.App/managedEnvironments@2022-06-01-preview' = {
  name: '${solution}-${project}-${'prod'}-environment'
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
  name: '${solution}-${project}-${'prod'}-ca'
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
        appId: '${solution}-${project}-${'prod'}-container'
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
          name: '${solution}-${project}-${'prod'}-container'
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

output ContainerAppUrl string = containerApp.properties.configuration.ingress.fqdn
output ProdContainerAppUrl string = containerApp.properties.configuration.ingress.fqdn
