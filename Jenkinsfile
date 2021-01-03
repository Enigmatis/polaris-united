#!groovy

properties([buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '7', numToKeepStr: ''))])

// Branches
DEV_BRANCH = 'development'
MASTER_BRANCH = 'master'


node {
    stage("Clean directory") {
        deleteDir()
    }

    stage("Checkout") {
        checkout scm
    }

    stage("Run CI?") {
        sh "git log -1 --pretty=%B > commitMessage"
        commitMessage = readFile 'commitMessage'
        if (commitMessage.contains('[skip ci]')) {
            currentBuild.result = 'ABORTED'
        }
    }

    if (currentBuild.result != 'ABORTED') {
        stage("Install dependencies & build") {
            sh "npm install"
        }

        stage("Run tests") {
            withCredentials([string(credentialsId:'ConnectionString', variable: 'CONNECTION_STRING')]) {
                withCredentials([string(credentialsId:'SchemaName', variable: 'SCHEMA_NAME')]) {
                    withCredentials([string(credentialsId:'PermissionsServiceUrl', variable: 'PERMISSIONS_SERVICE_URL')]) {
                        sh "npm t"
                    }
                }
            }
        }

        stage("Pre publish") {
            withCredentials([string(credentialsId:'GitHubToken', variable: 'GITHUB_TOKEN')]) {
                sh "git remote add pub https://ronkatz96:$GITHUB_TOKEN@github.com/enigmatis/polaris-united.git -f"
            }
            sh "git config --global user.email 'ron.katzzz@gmail.com' && git config --global user.name 'Jenkins Agent'"
            sh "git checkout --track pub/${env.BRANCH_NAME}"
        }

        stage("Lerna publish") {
           withCredentials([string(credentialsId:'GitHubToken', variable: 'GITHUB_TOKEN')]) {
               withCredentials([string(credentialsId:'NpmToken', variable: 'NPM_TOKEN')]) {
                   if (env.BRANCH_NAME == MASTER_BRANCH) {
                       echo "release branch: ${env.BRANCH_NAME}"
                       sh "npm run publish"
                   }
                   if (env.BRANCH_NAME == DEV_BRANCH) {
                       echo "release branch: ${env.BRANCH_NAME}"
                       sh "npm run publish-beta"
                   }
               }
           }
        }
    }

    stage("Clean workspace") {
        deleteDir()
    }
}
