param location string = resourceGroup().location
param solution string
param project string
param imageName string
param imageTag string

param primaryRegion string = location
param serverVersion string = '4.2'
param sharedAutoscaleMaxThroughput int = 1000

var devSuffix = 'dev'
var prodSuffix = 'prod'
var containerRegistryName = '${solution}acr'
var keyVaultName = '${solution}-key-vault'
var keyVaultSecretName = '${containerRegistryName}AdminPassword'

var devDbAccountName = toLower('${solution}-${project}-${devSuffix}-mongodb-account')
var devDbName = toLower('${solution}-${project}-${devSuffix}-mongodb')
var prodDbAccountName = toLower('${solution}-${project}-${prodSuffix}-mongodb-account')
var prodDbName = toLower('${solution}-${project}-${prodSuffix}-mongodb')

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

resource devDbAccount 'Microsoft.DocumentDB/databaseAccounts@2022-05-15' = {
  name: devDbAccountName
  location: location
  kind: 'MongoDB'
  properties: {
    consistencyPolicy: {
      defaultConsistencyLevel: 'Eventual'
    }
    locations: [
      {
        locationName: primaryRegion
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    databaseAccountOfferType: 'Standard'
    enableAutomaticFailover: true
    apiProperties: {
      serverVersion: serverVersion
    }
    capabilities: [
      {
        name: 'DisableRateLimitingResponses'
      }
    ]
  }
}

resource devMongoDB 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2022-05-15' = {
  parent: devDbAccount
  name: devDbName
  properties: {
    resource: {
      id: devDbName
    }
    options: {
      autoscaleSettings: {
        maxThroughput: sharedAutoscaleMaxThroughput
      }
    }
  }
}

var devMongoDbConnectionString = listConnectionStrings(devDbAccount.id, devDbAccount.apiVersion).connectionStrings[0].connectionString

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
    envPort: 80
    envMongoDbConnectionString: devMongoDbConnectionString
    envGoogleClientId: '450487781777-dqqg7ep8rtol5vmb47riauiv8mllrb03.apps.googleusercontent.com'
    envGoogleClientSecret: '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'
    envCookieKey: 'ajhfao87f68iu71839uiifdi8192fkj83129087ajhfao87f68iu71839uiifdi8192fkj83129087'
  }
}

resource prodDbAccount 'Microsoft.DocumentDB/databaseAccounts@2022-05-15' = {
  name: prodDbAccountName
  location: location
  kind: 'MongoDB'
  properties: {
    consistencyPolicy: {
      defaultConsistencyLevel: 'Eventual'
    }
    locations: [
      {
        locationName: primaryRegion
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    databaseAccountOfferType: 'Standard'
    enableAutomaticFailover: true
    apiProperties: {
      serverVersion: serverVersion
    }
    capabilities: [
      {
        name: 'DisableRateLimitingResponses'
      }
    ]
  }
}

resource prodMongoDB 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2022-05-15' = {
  parent: prodDbAccount
  name: prodDbName
  properties: {
    resource: {
      id: prodDbName
    }
    options: {
      autoscaleSettings: {
        maxThroughput: sharedAutoscaleMaxThroughput
      }
    }
  }
}

var prodMongoDbConnectionString = listConnectionStrings(prodDbAccount.id, prodDbAccount.apiVersion).connectionStrings[0].connectionString

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
    envPort: 80
    envMongoDbConnectionString: prodMongoDbConnectionString
    envGoogleClientId: '899455933664-q1r38u10d5icf12g8gim6ueib9g5ksnv.apps.googleusercontent.com'
    envGoogleClientSecret: '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'
    envCookieKey: 'ajhfao87f68iu71839uiifdi8192fkj83129087ajhfao87f68iu71839uiifdi8192fkj83129087'
  }
}

output DevContainerAppUrl string = devContainerApp.outputs.ContainerAppUrl
output ProdContainerAppUrl string = prodContainerApp.outputs.ContainerAppUrl
