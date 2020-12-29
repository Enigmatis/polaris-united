#!groovy

properties([buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '7', numToKeepStr: ''))])

NPM_TOKEN = "5fc672db-aebe-4b11-95a6-1dcfe814f430"
GITHUB_TOKEN = "51eb10a18ba87ab1b5f213536ffc20a04ab9384a"

node {
    stage("Clean directory") {
        deleteDir()
    }

    stage("Checkout") {
        checkout scm
    }

    stage("Install dependencies & build") {
        sh "npm install"
    }

    stage("Run tests") {
        try {
            sh "git fetch --prune"
            sh "git fetch origin development:development"
            sh "lerna exec npm test --since development"
        }
        catch (err) {
            junit "test/*.xml"
            throw err
        }
    }

    stage("Pre publish scripts") {
        echo '"//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc'
        sh "git remote add pub https://DoctorVoid:${GITHUB_TOKEN}@github.com/enigmatis/polaris-united.git -f"
        sh "git config --global user.email 'furmanmail@gmail.com' && git config --global user.name 'Travis Agent'"
        sh "git checkout ${env.BRANCH_NAME}"
    }

     stage("Lerna publish") {
        echo "${env.BRANCH_NAME}"
           if (env.BRANCH_NAME == 'master') {
                echo "release branch: ${env.BRANCH_NAME}"
                sh "lerna publish --yes --git-remote pub --message 'chore(release) [skip ci]'"
           }
           if (env.BRANCH_NAME == 'development') {
                echo "release branch: ${env.BRANCH_NAME}"
                sh "lerna publish --dist-tag beta --yes --git-remote pub --message 'chore(release) [skip ci]'"
           }
     }

     stage("Clean directory") {
           deleteDir()
     }
}
