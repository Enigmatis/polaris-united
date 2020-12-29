#!groovy

properties([buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '7', numToKeepStr: ''))])

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
        sh "npm run test"
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
