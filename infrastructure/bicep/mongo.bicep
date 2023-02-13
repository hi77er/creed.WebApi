param env string
param solution string
param project string
param location string = resourceGroup().location
param databaseAccountName string = toLower('${solution}-${project}-${env}-mongodb-account')
param primaryRegion string = location
param serverVersion string = '4.2'
param databaseName string = toLower('${solution}-${project}-${env}-mongodb')
param sharedAutoscaleMaxThroughput int = 1000

resource account 'Microsoft.DocumentDB/databaseAccounts@2022-05-15' = {
  name: databaseAccountName
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

resource database 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2022-05-15' = {
  parent: account
  name: databaseName
  properties: {
    resource: {
      id: databaseName
    }
    options: {
      autoscaleSettings: {
        maxThroughput: sharedAutoscaleMaxThroughput
      }
    }
  }
}
