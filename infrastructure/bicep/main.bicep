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

module devAca 'aca.bicep' = {
  name: 'devAca'
  dependsOn: [
    core
  ]
  params: {
    env: 'dev'
    location: location
    project: project
    solution: solution
    containerRegistryName: core.outputs.ContainerRegistryName
    containerRegistryPassword: keyVault.getSecret(core.outputs.ContainerRegistrySecretName)
    imageName: imageName
    imageTag: imageTag
  }
}

module prodAca 'aca.bicep' = {
  name: 'prodAca'
  dependsOn: [
    core
  ]
  params: {
    env: 'prod'
    location: location
    project: project
    solution: solution
    containerRegistryName: core.outputs.ContainerRegistryName
    containerRegistryPassword: keyVault.getSecret(core.outputs.ContainerRegistrySecretName)
    imageName: imageName
    imageTag: imageTag
  }
}

output DevEndpoint string = devAca.outputs.ContainerAppUrl
output ProdEndpoint string = prodAca.outputs.ContainerAppUrl
