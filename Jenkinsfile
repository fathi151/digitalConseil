pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry-url' // Replace with your Docker registry URL
        IMAGE_TAG = "${BUILD_NUMBER}"
        MYSQL_ROOT_PASSWORD = ''
        MYSQL_DATABASE = 'conseil'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Verify Workspace') {
            steps {
                // Debug: List workspace contents
                bat 'dir'
                bat 'dir BackEsprit'
                bat 'dir BackEsprit\\SmartConseil-Back'
                bat 'dir BackEsprit\\SmartConseil-Back\\microservices'
            }
        }
        
        stage('Build Backend Services') {
            parallel {
                stage('Build Conseil Service') {
                    steps {
                        script {
                            def servicePath = 'BackEsprit\\SmartConseil-Back\\microservices\\microserviceConseil'
                            bat "dir ${servicePath}"
                            bat "if exist ${servicePath}\\pom.xml (echo POM found) else (echo POM NOT found && exit 1)"
                            
                            dir('BackEsprit/SmartConseil-Back/microservices/microserviceConseil') {
                                bat 'dir'
                                bat 'mvn clean package -DskipTests'
                                bat "docker build -t conseil-service:${IMAGE_TAG} ."
                            }
                        }
                    }
                }
                
                stage('Build Planification Service') {
                    steps {
                        script {
                            def servicePath = 'BackEsprit\\SmartConseil-Back\\microservices\\microservicePlanification'
                            bat "dir ${servicePath}"
                            bat "if exist ${servicePath}\\pom.xml (echo POM found) else (echo POM NOT found && exit 1)"
                            
                            dir('BackEsprit/SmartConseil-Back/microservices/microservicePlanification') {
                                bat 'dir'
                                bat 'mvn clean package -DskipTests'
                                bat "docker build -t planification-service:${IMAGE_TAG} ."
                            }
                        }
                    }
                }
                
                stage('Build Rapport Service') {
                    steps {
                        script {
                            def servicePath = 'BackEsprit\\SmartConseil-Back\\microservices\\microserviceRapport'
                            bat "dir ${servicePath}"
                            bat "if exist ${servicePath}\\pom.xml (echo POM found) else (echo POM NOT found && exit 1)"
                            
                            dir('BackEsprit/SmartConseil-Back/microservices/microserviceRapport') {
                                bat 'dir'
                                bat 'mvn clean package -DskipTests'
                                bat "docker build -t rapport-service:${IMAGE_TAG} ."
                            }
                        }
                    }
                }
                
                stage('Build Rectification Service') {
                    steps {
                        script {
                            def servicePath = 'BackEsprit\\SmartConseil-Back\\microservices\\microserviceRectification'
                            bat "dir ${servicePath}"
                            bat "if exist ${servicePath}\\pom.xml (echo POM found) else (echo POM NOT found && exit 1)"
                            
                            dir('BackEsprit/SmartConseil-Back/microservices/microserviceRectification') {
                                bat 'dir'
                                bat 'mvn clean package -DskipTests'
                                bat "docker build -t rectification-service:${IMAGE_TAG} ."
                            }
                        }
                    }
                }
                
                stage('Build User Service') {
                    steps {
                        script {
                            def servicePath = 'BackEsprit\\SmartConseil-Back\\microservices\\microserviceUser'
                            bat "dir ${servicePath}"
                            bat "if exist ${servicePath}\\pom.xml (echo POM found) else (echo POM NOT found && exit 1)"
                            
                            dir('BackEsprit/SmartConseil-Back/microservices/microserviceUser') {
                                bat 'dir'
                                bat 'mvn clean package -DskipTests'
                                bat "docker build -t user-service:${IMAGE_TAG} ."
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('FrontEsprit/SmartConseil-Front') {
                    bat "docker build -t frontend-app:${IMAGE_TAG} ."
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        script {
                            def services = [
                                'microserviceConseil',
                                'microservicePlanification', 
                                'microserviceRapport',
                                'microserviceRectification',
                                'microserviceUser'
                            ]
                            
                            services.each { service ->
                                dir("BackEsprit/SmartConseil-Back/microservices/${service}") {
                                    bat 'mvn test'
                                }
                            }
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: '**/target/surefire-reports/*.xml'
                        }
                    }
                }
                
                stage('Frontend Tests') {
                    steps {
                        dir('FrontEsprit/SmartConseil-Front') {
                            bat 'npm ci'
                            bat 'npm run test -- --watch=false --browsers=ChromeHeadless'
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: '**/test-results.xml'
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    // OWASP Dependency Check for backend services
                    def services = [
                        'microserviceConseil',
                        'microservicePlanification', 
                        'microserviceRapport',
                        'microserviceRectification',
                        'microserviceUser'
                    ]
                    
                    services.each { service ->
                        dir("BackEsprit/SmartConseil-Back/microservices/${service}") {
                            bat 'mvn org.owasp:dependency-check-maven:check'
                        }
                    }
                    
                    // NPM Audit for frontend
                    dir('FrontEsprit/SmartConseil-Front') {
                        bat 'npm audit --audit-level moderate'
                    }
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                script {
                    // Start services for integration testing
                    bat 'docker-compose -f docker-compose.yml up -d mysql'
                    bat 'timeout /t 30 /nobreak' // Wait for MySQL to be ready (Windows equivalent of sleep)
                    
                    // Run integration tests
                    bat 'docker-compose -f docker-compose.yml up -d'
                    bat 'timeout /t 60 /nobreak' // Wait for all services to be ready
                    
                    // Add your integration test commands here
                    // Example: API health checks using PowerShell
                    powershell '''
                        try {
                            Invoke-RestMethod -Uri "http://localhost:8081/actuator/health" -Method Get
                            Invoke-RestMethod -Uri "http://localhost:8082/actuator/health" -Method Get
                            Invoke-RestMethod -Uri "http://localhost:8083/actuator/health" -Method Get
                            Invoke-RestMethod -Uri "http://localhost:8084/actuator/health" -Method Get
                            Invoke-RestMethod -Uri "http://localhost:8085/actuator/health" -Method Get
                            Invoke-RestMethod -Uri "http://localhost:4200" -Method Get
                            Write-Host "All health checks passed!"
                        } catch {
                            Write-Error "Health check failed: $_"
                            exit 1
                        }
                    '''
                }
            }
            post {
                always {
                    bat 'docker-compose -f docker-compose.yml down -v'
                }
            }
        }
        
        stage('Push Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    // Tag and push images to registry
                    def images = [
                        'conseil-service',
                        'planification-service',
                        'rapport-service',
                        'rectification-service',
                        'user-service',
                        'frontend-app'
                    ]
                    
                    images.each { image ->
                        bat "docker tag ${image}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${image}:${IMAGE_TAG}"
                        bat "docker tag ${image}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${image}:latest"
                        bat "docker push ${DOCKER_REGISTRY}/${image}:${IMAGE_TAG}"
                        bat "docker push ${DOCKER_REGISTRY}/${image}:latest"
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    // Deploy to staging environment using PowerShell
                    powershell '''
                        # Update docker-compose with new image tags
                        (Get-Content docker-compose.yml) -replace ':latest', (':' + $env:IMAGE_TAG) | Set-Content docker-compose.yml
                        
                        # Deploy to staging
                        docker-compose -f docker-compose.yml up -d
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Add manual approval for production deployment
                    input message: 'Deploy to Production?', ok: 'Deploy'
                    
                    // Deploy to production environment using PowerShell
                    powershell '''
                        # Update docker-compose with new image tags
                        (Get-Content docker-compose.yml) -replace ':latest', (':' + $env:IMAGE_TAG) | Set-Content docker-compose.yml
                        
                        # Deploy to production
                        docker-compose -f docker-compose.yml up -d
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Clean up Docker images to save space
            bat 'docker system prune -f'
            
            // Archive artifacts
            archiveArtifacts artifacts: '**/target/*.jar', allowEmptyArchive: true
            archiveArtifacts artifacts: '**/dist/**', allowEmptyArchive: true
        }
        
        success {
            echo 'Pipeline succeeded!'
            // Add notification logic here (Slack, email, etc.)
        }
        
        failure {
            echo 'Pipeline failed!'
            // Add notification logic here (Slack, email, etc.)
        }
        
        unstable {
            echo 'Pipeline is unstable!'
            // Add notification logic here
        }
    }
}
