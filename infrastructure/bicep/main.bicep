param location string
param solution string
param project string
param imageName string
param imageTag string

module core 'core.bicep' = {
  name: 'core'
  params: {
    location: location
    solution: solution
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2019-09-01' existing = {
  name: core.outputs.KeyVaultName
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
