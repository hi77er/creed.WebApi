param location string = resourceGroup().location
param solution string
param project string
param imageName string
param imageTag string

var devSuffix = 'dev'
var prodSuffix = 'prod'
var containerRegistryName = '${solution}acr'
var keyVaultName = '${solution}-key-vault'
var keyVaultSecretName = '${containerRegistryName}AdminPassword'

module devMongoDb 'mongo.bicep' = {
  name: 'devMongoDb'
  params: {
    env: devSuffix
    solution: solution
    project: project
    location: location
  }
}

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

module devContainerApp 'aca.bicep' = {
  name: 'devContainerApp'
  params: {
    solution: solution
    project: project
    env: devSuffix
    location: location
    imageName: imageName
    imageTag: imageTag
    containerRegistryPassword: containerRegistry.listCredentials().passwords[0].value
    containerRegistryName: containerRegistryName
  }
}

module prodContainerApp 'aca.bicep' = {
  name: 'prodContainerApp'
  params: {
    solution: solution
    project: project
    env: prodSuffix
    location: location
    imageName: imageName
    imageTag: imageTag
    containerRegistryPassword: containerRegistry.listCredentials().passwords[0].value
    containerRegistryName: containerRegistryName
  }
}

output DevContainerAppUrl string = devContainerApp.outputs.ContainerAppUrl
output ProdContainerAppUrl string = prodContainerApp.outputs.ContainerAppUrl
