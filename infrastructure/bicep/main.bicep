param location string = resourceGroup().location
param solution string
param apiProject string
param clientProject string
param apiImageName string
param apiImageTag string
param clientImageName string
param clientImageTag string

param primaryRegion string = location
param serverVersion string = '4.2'
param sharedAutoscaleMaxThroughput int = 1000

var devSuffix = 'dev'
var prodSuffix = 'prod'
var devContainerRegistryName = toLower('${solution}${devSuffix}acr')
var prodContainerRegistryName = toLower('${solution}${prodSuffix}acr')
var keyVaultName = '${solution}-key-vault'
var devCRAdminSecretName = '${devContainerRegistryName}AdminPassword'
var prodCRAdminSecretName = '${prodContainerRegistryName}AdminPassword'

var devDbAccountName = toLower('${solution}-${devSuffix}-mongodb-account')
var devDbName = toLower('${solution}-${devSuffix}-mongodb')
var prodDbAccountName = toLower('${solution}-${prodSuffix}-mongodb-account')
var prodDbName = toLower('${solution}-${prodSuffix}-mongodb')

var devAPIPort = 80
var devClientPort = 80
var devGoogleClientId = '450487781777-dqqg7ep8rtol5vmb47riauiv8mllrb03.apps.googleusercontent.com'
var devGoogleClientSecret = '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'
var devCookieKey = 'ajhfao87f68iu71839uiifdi8192fkj83129087ajhfao87f68iu71839uiifdi8192fkj83129087'
var devJwtTokenSecret = 'dddsd-dahdhd-kjfjdhrhrerj-uurhr-jeee9'
var devRefreshTokenSecret = 'kmn2gkjddshfdjh73273bdjsj84-jdjd7632vg'
var devJwtExpirySeconds = 900 // 15 mins = 60 seconds * 15 minutes
var devRefreshTokenExpirySeconds = 2592000 // 30 days = 60 seconds * 60 minutes * 24 hours * 30 days

var prodAPIPort = 80
var prodClientPort = 80
var prodGoogleClientId = '899455933664-q1r38u10d5icf12g8gim6ueib9g5ksnv.apps.googleusercontent.com'
var prodGoogleClientSecret = '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'
var prodCookieKey = '6642ao87f68123gfs839uiifdi8192fkj83129087ajhfao87f68iu71839dasd131513129lca'
var prodJwtTokenSecret = 'jdsd-dahdhd-kjfjdhrhrerj-uurhr-jjge7'
var prodRefreshTokenSecret = '34f2gkjddshfdjh73273bdjsj84-jdjd763274'
var prodJwtExpirySeconds = 900 // 15 mins = 60 seconds * 15 minutes
var prodRefreshTokenExpirySeconds = 2592000 // 30 days = 60 seconds * 60 minutes * 24 hours * 30 days

// DEVELOPMENT ENV

resource devContainerRegistry 'Microsoft.ContainerRegistry/registries@2021-06-01-preview' = {
  name: devContainerRegistryName
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

resource devCRAdminSecret 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {
  name: devCRAdminSecretName
  parent: keyVault
  properties: {
    value: devContainerRegistry.listCredentials().passwords[0].value
  }
}

resource devLogAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2020-10-01' = {
  name: '${solution}-${devSuffix}-la-workspace'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
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

resource devContainerAppEnvironment 'Microsoft.App/managedEnvironments@2022-06-01-preview' = {
  name: '${solution}-${devSuffix}-environment'
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

module devClientContainerApp 'aca.bicep' = {
  name: 'devClientContainerApp'
  params: {
    solution: solution
    project: clientProject
    env: devSuffix
    location: location
    containerAppEnvironmentId: devContainerAppEnvironment.id
    containerRegistryPassword: devContainerRegistry.listCredentials().passwords[0].value
    containerRegistryName: devContainerRegistryName
    imageName: clientImageName
    imageTag: clientImageTag
    envVariables: [
      // PORT - SHOULD BE ALWAYS FIRST IN THE ARRAY
      { name: 'PORT', value: string(devClientPort) }
    ]
  }
}

var devMongoDbConnectionString = listConnectionStrings(devDbAccount.id, devDbAccount.apiVersion).connectionStrings[0].connectionString
var devCorsWhitelistedDomains = devClientContainerApp.outputs.ContainerAppUrl

module devAPIContainerApp 'aca.bicep' = {
  name: 'devAPIContainerApp'
  params: {
    solution: solution
    project: apiProject
    env: devSuffix
    location: location
    containerAppEnvironmentId: devContainerAppEnvironment.id
    containerRegistryPassword: devContainerRegistry.listCredentials().passwords[0].value
    containerRegistryName: devContainerRegistryName
    imageName: apiImageName
    imageTag: apiImageTag
    envVariables: [
      // PORT - SHOULD BE ALWAYS FIRST IN THE ARRAY
      { name: 'PORT', value: string(devAPIPort) }
      { name: 'MONGO_DB_CONNECTION_STRING', value: devMongoDbConnectionString }
      { name: 'AUTH_GOOGLE_CLIENT_ID', value: devGoogleClientId }
      { name: 'AUTH_GOOGLE_CLIENT_SECRET', value: devGoogleClientSecret }
      { name: 'AUTH_COOKIE_KEY', value: devCookieKey }
      { name: 'AUTH_JWT_TOKEN_SECRET', value: devJwtTokenSecret }
      { name: 'AUTH_REFRESH_TOKEN_SECRET', value: devRefreshTokenSecret }
      { name: 'AUTH_JWT_TOKEN_EXPIRY_SECONDS', value: string(devJwtExpirySeconds) }
      { name: 'AUTH_REFRESH_TOKEN_EXPIRY_SECONDS', value: string(devRefreshTokenExpirySeconds) }
      { name: 'CORS_WHITELISTED_DOMAINS', value: devCorsWhitelistedDomains }
    ]
  }
}

// PRODUCTION ENV

resource prodContainerRegistry 'Microsoft.ContainerRegistry/registries@2021-06-01-preview' = {
  name: prodContainerRegistryName
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

resource prodCRAdminSecret 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {
  name: prodCRAdminSecretName
  parent: keyVault
  properties: {
    value: prodContainerRegistry.listCredentials().passwords[0].value
  }
}

resource prodLogAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2020-10-01' = {
  name: '${solution}-${prodSuffix}-la-workspace'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
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

resource prodContainerAppEnvironment 'Microsoft.App/managedEnvironments@2022-06-01-preview' = {
  name: '${solution}-${prodSuffix}-environment'
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

module prodClientContainerApp 'aca.bicep' = {
  name: 'prodClientContainerApp'
  params: {
    solution: solution
    project: clientProject
    env: prodSuffix
    location: location
    containerAppEnvironmentId: prodContainerAppEnvironment.id
    containerRegistryPassword: prodContainerRegistry.listCredentials().passwords[0].value
    containerRegistryName: prodContainerRegistryName
    imageName: clientImageName
    imageTag: clientImageTag
    envVariables: [
      // PORT - SHOULD BE ALWAYS FIRST IN THE ARRAY
      { name: 'PORT', value: string(prodClientPort) }
    ]
  }
}

var prodMongoDbConnectionString = listConnectionStrings(prodDbAccount.id, prodDbAccount.apiVersion).connectionStrings[0].connectionString
var prodCorsWhitelistedDomains = prodClientContainerApp.outputs.ContainerAppUrl

module prodAPIContainerApp 'aca.bicep' = {
  name: 'prodAPIContainerApp'
  params: {
    solution: solution
    project: apiProject
    env: prodSuffix
    location: location
    containerAppEnvironmentId: prodContainerAppEnvironment.id
    containerRegistryPassword: prodContainerRegistry.listCredentials().passwords[0].value
    containerRegistryName: prodContainerRegistryName
    imageName: apiImageName
    imageTag: apiImageTag
    envVariables: [
      // PORT - SHOULD BE ALWAYS FIRST IN THE ARRAY
      { name: 'PORT', value: string(prodAPIPort) }
      { name: 'MONGO_DB_CONNECTION_STRING', value: prodMongoDbConnectionString }
      { name: 'AUTH_GOOGLE_CLIENT_ID', value: prodGoogleClientId }
      { name: 'AUTH_GOOGLE_CLIENT_SECRET', value: prodGoogleClientSecret }
      { name: 'AUTH_COOKIE_KEY', value: prodCookieKey }
      { name: 'AUTH_JWT_TOKEN_SECRET', value: prodJwtTokenSecret }
      { name: 'AUTH_REFRESH_TOKEN_SECRET', value: prodRefreshTokenSecret }
      { name: 'AUTH_JWT_TOKEN_EXPIRY_SECONDS', value: string(prodJwtExpirySeconds) }
      { name: 'AUTH_REFRESH_TOKEN_EXPIRY_SECONDS', value: string(prodRefreshTokenExpirySeconds) }
      { name: 'CORS_WHITELISTED_DOMAINS', value: prodCorsWhitelistedDomains }
    ]
  }
}

output DevAPIContainerAppUrl string = devAPIContainerApp.outputs.ContainerAppUrl
output ProdAPIContainerAppUrl string = prodAPIContainerApp.outputs.ContainerAppUrl
