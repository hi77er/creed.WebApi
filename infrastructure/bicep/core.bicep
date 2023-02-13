// param location string
// param solution string

// var containerRegistryName = '${solution}acr'
// var keyVaultName = '${solution}-key-vault'
// var keyVaultSecretName = '${containerRegistryName}AdminPassword'

// resource containerRegistry 'Microsoft.ContainerRegistry/registries@2021-06-01-preview' = {
//   name: containerRegistryName
//   location: location
//   sku: {
//     name: 'Basic'
//   }
//   properties: {
//     adminUserEnabled: true
//     publicNetworkAccess: 'Enabled'
//     networkRuleBypassOptions: 'AzureServices'
//     zoneRedundancy: 'Disabled'
//     anonymousPullEnabled: false
//   }
// }

// resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
//   name: keyVaultName
//   location: location
//   properties: {
//     enabledForDeployment: true
//     enabledForTemplateDeployment: true
//     enableRbacAuthorization: true
//     enabledForDiskEncryption: true
//     tenantId: tenant().tenantId
//     sku: {
//       family: 'A'
//       name: 'standard'
//     }
//   }
// }

// resource keyVaultSecret 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {
//   name: keyVaultSecretName
//   parent: keyVault
//   properties: {
//     value: containerRegistry.listCredentials().passwords[0].value
//   }
// }

// output ContainerRegistryName string = containerRegistryName
// output ContainerRegistryUsername string = containerRegistryName
// output KeyVaultName string = keyVaultName
// output ContainerRegistrySecretName string = split(keyVaultSecretName, '/')[1]
