pipeline {
    agent any

    stages {

        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Clone Source') {
            steps {
                git branch: 'main',
                url: 'https://github.com/DHARSHINISELVARAJ13/Dockerproject.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t quickblog-backend ./Backend'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t quickblog-frontend ./client'
            }
        }

        stage('Deploy MongoDB') {
            steps {
                sh '''
                docker rm -f quickblog-mongodb || true
                docker run -d --name quickblog-mongodb \
                -p 27017:27017 \
                -e MONGO_INITDB_ROOT_USERNAME=root \
                -e MONGO_INITDB_ROOT_PASSWORD=password \
                mongo:latest
                '''
            }
        }

        stage('Deploy Backend') {
            steps {
                sh '''
                docker rm -f quickblog-backend || true
                docker run -d --name quickblog-backend \
                -p 3000:3000 \
                --link quickblog-mongodb:mongodb \
                quickblog-backend
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                docker rm -f quickblog-frontend || true
                docker run -d --name quickblog-frontend \
                -p 8081:80 \
                --link quickblog-backend:backend \
                quickblog-frontend
                '''
            }
        }

        stage('Verify') {
            steps {
                sh 'docker ps'
            }
        }
    }
}