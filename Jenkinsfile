pipeline {
    agent any

    stages {

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

        stage('Deploy Backend') {
            steps {
                sh '''
                docker rm -f quickblog-backend || true
                docker run -d --name quickblog-backend \
                -p 3000:3000 \
                -e PORT=3000 \
                -e MONGO_URI="$MONGO_URI" \
                -e NODE_ENV=development \
                -e JWT_SECRET="$JWT_SECRET" \
                -e OPENAI_API_KEY="$OPENAI_API_KEY" \
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