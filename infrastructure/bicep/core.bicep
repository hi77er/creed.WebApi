param location string
param solution string
param spPolicyAppId string
param spPolicyObjectId string
param spPolicyTenantId string

var keyVaultName = '${solution}-key-vault'

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2021-06-01-preview' = {
  name: '${solution}acr'
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

resource keyVault 'Microsoft.KeyVault/vaults@2021-10-01' = {
  name: keyVaultName
  location: location
  properties: {
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enableRbacAuthorization: true
    enabledForDiskEncryption: true
    tenantId: spPolicyTenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
  }
}

resource keyVaultAccessPolicyForSecrets 'Microsoft.KeyVault/vaults/accessPolicies@2022-07-01' = {
  parent: keyVault
  name: 'add'
  properties: {
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
  }
}

resource keyVaultSecret 'Microsoft.KeyVault/vaults/secrets@2019-09-01' = {
  name: '${containerRegistry.name}AdminPassword'
  parent: keyVault
  properties: {
    value: containerRegistry.listCredentials().passwords[0].value
  }
}

output ContainerRegistryName string = containerRegistry.name
output ContainerRegistryUsername string = containerRegistry.name
output KeyVaultName string = keyVaultName
output ContainerRegistrySecretName string = split(keyVaultSecret.name, '/')[1]
