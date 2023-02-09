param containerapps_ca_srvymkr_mongo_dev_name string = 'ca-srvymkr-mongo-dev'
param containerapps_ca_srvymkr_server_dev_name string = 'ca-srvymkr-server-dev'
param managedEnvironments_cae_srvymkr_dev_name string = 'cae-srvymkr-dev'
param containerapps_ca_srvymkr_server_prod_name string = 'ca-srvymkr-server-prod'
param managedEnvironments_cae_srvymkr_prod_name string = 'cae-srvymkr-prod'
param registries_CRTestingGeneral_name string = 'CRTestingGeneral'
param databaseAccounts_cfm_personal_test_general_name string = 'cfm-personal-test-general'
param workspaces_workspacergpersonaltestgeneral9544_name string = 'workspacergpersonaltestgeneral9544'
param workspaces_workspacergpersonaltestgenerala652_name string = 'workspacergpersonaltestgenerala652'

resource managedEnvironments_cae_srvymkr_dev_name_resource 'Microsoft.App/managedEnvironments@2022-10-01' = {
  name: managedEnvironments_cae_srvymkr_dev_name
  location: 'westeurope'
  sku: {
    name: 'Consumption'
  }
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: '8195b149-b6f7-469d-af59-2ad4c1381e09'
      }
    }
    zoneRedundant: false
    customDomainConfiguration: {
    }
  }
}

resource managedEnvironments_cae_srvymkr_prod_name_resource 'Microsoft.App/managedEnvironments@2022-10-01' = {
  name: managedEnvironments_cae_srvymkr_prod_name
  location: 'westeurope'
  sku: {
    name: 'Consumption'
  }
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: 'e41dfd84-5824-4158-be31-b41fa3648d77'
      }
    }
    zoneRedundant: false
    customDomainConfiguration: {
    }
  }
}

resource registries_CRTestingGeneral_name_resource 'Microsoft.ContainerRegistry/registries@2022-02-01-preview' = {
  name: registries_CRTestingGeneral_name
  location: 'westeurope'
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    policies: {
      quarantinePolicy: {
        status: 'disabled'
      }
      trustPolicy: {
        type: 'Notary'
        status: 'disabled'
      }
      retentionPolicy: {
        days: 7
        status: 'disabled'
      }
      exportPolicy: {
        status: 'enabled'
      }
      azureADAuthenticationAsArmPolicy: {
        status: 'enabled'
      }
      softDeletePolicy: {
        retentionDays: 7
        status: 'disabled'
      }
    }
    encryption: {
      status: 'disabled'
    }
    dataEndpointEnabled: false
    publicNetworkAccess: 'Enabled'
    networkRuleBypassOptions: 'AzureServices'
    zoneRedundancy: 'Disabled'
    anonymousPullEnabled: false
  }
}

resource databaseAccounts_cfm_personal_test_general_name_resource 'Microsoft.DocumentDB/databaseAccounts@2022-08-15' = {
  name: databaseAccounts_cfm_personal_test_general_name
  location: 'West Europe'
  tags: {
    defaultExperience: 'Azure Cosmos DB for MongoDB API'
    'hidden-cosmos-mmspecial': ''
  }
  kind: 'MongoDB'
  identity: {
    type: 'None'
  }
  properties: {
    publicNetworkAccess: 'Enabled'
    enableAutomaticFailover: false
    enableMultipleWriteLocations: false
    isVirtualNetworkFilterEnabled: false
    virtualNetworkRules: []
    disableKeyBasedMetadataWriteAccess: false
    enableFreeTier: true
    enableAnalyticalStorage: false
    analyticalStorageConfiguration: {
      schemaType: 'FullFidelity'
    }
    databaseAccountOfferType: 'Standard'
    defaultIdentity: 'FirstPartyIdentity'
    networkAclBypass: 'None'
    disableLocalAuth: false
    enablePartitionMerge: false
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
      maxIntervalInSeconds: 5
      maxStalenessPrefix: 100
    }
    apiProperties: {
      serverVersion: '4.2'
    }
    locations: [
      {
        locationName: 'West Europe'
        provisioningState: 'Succeeded'
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    cors: []
    capabilities: [
      {
        name: 'EnableMongo'
      }
      {
        name: 'DisableRateLimitingResponses'
      }
    ]
    ipRules: []
    backupPolicy: {
      type: 'Periodic'
      periodicModeProperties: {
        backupIntervalInMinutes: 240
        backupRetentionIntervalInHours: 8
        backupStorageRedundancy: 'Geo'
      }
    }
    networkAclBypassResourceIds: []
    capacity: {
      totalThroughputLimit: 1000
    }
    keysMetadata: {
    }
  }
}

resource workspaces_workspacergpersonaltestgeneral9544_name_resource 'Microsoft.OperationalInsights/workspaces@2021-12-01-preview' = {
  name: workspaces_workspacergpersonaltestgeneral9544_name
  location: 'westeurope'
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    workspaceCapping: {
      dailyQuotaGb: -1
    }
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

resource workspaces_workspacergpersonaltestgenerala652_name_resource 'Microsoft.OperationalInsights/workspaces@2021-12-01-preview' = {
  name: workspaces_workspacergpersonaltestgenerala652_name
  location: 'westeurope'
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    workspaceCapping: {
      dailyQuotaGb: -1
    }
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

resource containerapps_ca_srvymkr_mongo_dev_name_resource 'Microsoft.App/containerapps@2022-10-01' = {
  name: containerapps_ca_srvymkr_mongo_dev_name
  location: 'West Europe'
  identity: {
    type: 'None'
  }
  properties: {
    managedEnvironmentId: managedEnvironments_cae_srvymkr_dev_name_resource.id
    environmentId: managedEnvironments_cae_srvymkr_dev_name_resource.id
    configuration: {
      secrets: [
        {
          name: 'reg-pswd-dd61f922-9b08'
        }
      ]
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 27017
        exposedPort: 0
        transport: 'Auto'
        traffic: [
          {
            weight: 100
            latestRevision: true
          }
        ]
        allowInsecure: true
      }
      registries: [
        {
          server: 'crtestinggeneral.azurecr.io'
          username: 'CRTestingGeneral'
          passwordSecretRef: 'reg-pswd-dd61f922-9b08'
        }
      ]
    }
    template: {
      revisionSuffix: 'revdev'
      containers: [
        {
          image: 'crtestinggeneral.azurecr.io/srvymkr-mongo:latest'
          name: 'container-srvymkr-mongo-dev'
          resources: {
            cpu: '0.25'
            memory: '0.5Gi'
          }
          probes: []
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 2
      }
    }
  }
}

resource containerapps_ca_srvymkr_server_dev_name_resource 'Microsoft.App/containerapps@2022-10-01' = {
  name: containerapps_ca_srvymkr_server_dev_name
  location: 'West Europe'
  identity: {
    type: 'None'
  }
  properties: {
    managedEnvironmentId: managedEnvironments_cae_srvymkr_prod_name_resource.id
    environmentId: managedEnvironments_cae_srvymkr_prod_name_resource.id
    configuration: {
      secrets: [
        {
          name: 'crtestinggeneralazurecrio-crtestinggeneral'
        }
      ]
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 5000
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
      registries: [
        {
          server: 'crtestinggeneral.azurecr.io'
          username: 'CRTestingGeneral'
          passwordSecretRef: 'crtestinggeneralazurecrio-crtestinggeneral'
        }
      ]
    }
    template: {
      revisionSuffix: 'revdev'
      containers: [
        {
          image: 'crtestinggeneral.azurecr.io/srvymkr-server:latest'
          name: 'container-srvymkr-server-dev'
          env: [
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
        maxReplicas: 10
      }
    }
  }
}

resource containerapps_ca_srvymkr_server_prod_name_resource 'Microsoft.App/containerapps@2022-10-01' = {
  name: containerapps_ca_srvymkr_server_prod_name
  location: 'West Europe'
  identity: {
    type: 'None'
  }
  properties: {
    managedEnvironmentId: managedEnvironments_cae_srvymkr_prod_name_resource.id
    environmentId: managedEnvironments_cae_srvymkr_prod_name_resource.id
    configuration: {
      secrets: [
        {
          name: 'reg-pswd-8cfc3dbf-ac30'
        }
      ]
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 5000
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
      registries: [
        {
          server: 'crtestinggeneral.azurecr.io'
          username: 'CRTestingGeneral'
          passwordSecretRef: 'reg-pswd-8cfc3dbf-ac30'
        }
      ]
    }
    template: {
      revisionSuffix: 'revprod'
      containers: [
        {
          image: 'crtestinggeneral.azurecr.io/srvymkr-server:latest'
          name: 'container-srvymkr-server-prod'
          env: [
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
        maxReplicas: 2
      }
    }
  }
}

resource containerapps_ca_srvymkr_server_dev_name_current 'Microsoft.App/containerApps/sourcecontrols@2022-10-01' = {
  parent: containerapps_ca_srvymkr_server_dev_name_resource
  name: 'current'
  properties: {
    repoUrl: 'https://github.com/hi77er/srvymkr.Server'
    branch: 'develop'
    githubActionConfiguration: {
      registryInfo: {
        registryUrl: 'crtestinggeneral.azurecr.io'
        registryUserName: 'CRTestingGeneral'
      }
      contextPath: './'
      image: 'ca-srvymkr-server-dev:\${{ github.sha }}'
    }
  }
}

resource containerapps_ca_srvymkr_server_prod_name_current 'Microsoft.App/containerApps/sourcecontrols@2022-10-01' = {
  parent: containerapps_ca_srvymkr_server_prod_name_resource
  name: 'current'
  properties: {
    repoUrl: 'https://github.com/hi77er/srvymkr.Server'
    branch: 'master'
    githubActionConfiguration: {
      registryInfo: {
        registryUrl: 'crtestinggeneral.azurecr.io'
        registryUserName: 'CRTestingGeneral'
      }
      contextPath: './'
      image: 'ca-srvymkr-server-prod:\${{ github.sha }}'
    }
  }
}

resource registries_CRTestingGeneral_name_repositories_admin 'Microsoft.ContainerRegistry/registries/scopeMaps@2022-02-01-preview' = {
  parent: registries_CRTestingGeneral_name_resource
  name: '_repositories_admin'
  properties: {
    description: 'Can perform all read, write and delete operations on the registry'
    actions: [
      'repositories/*/metadata/read'
      'repositories/*/metadata/write'
      'repositories/*/content/read'
      'repositories/*/content/write'
      'repositories/*/content/delete'
    ]
  }
}

resource registries_CRTestingGeneral_name_repositories_pull 'Microsoft.ContainerRegistry/registries/scopeMaps@2022-02-01-preview' = {
  parent: registries_CRTestingGeneral_name_resource
  name: '_repositories_pull'
  properties: {
    description: 'Can pull any repository of the registry'
    actions: [
      'repositories/*/content/read'
    ]
  }
}

resource registries_CRTestingGeneral_name_repositories_push 'Microsoft.ContainerRegistry/registries/scopeMaps@2022-02-01-preview' = {
  parent: registries_CRTestingGeneral_name_resource
  name: '_repositories_push'
  properties: {
    description: 'Can push to any repository of the registry'
    actions: [
      'repositories/*/content/read'
      'repositories/*/content/write'
    ]
  }
}
