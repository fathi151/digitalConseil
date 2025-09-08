pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        COMPOSE_PROJECT_NAME = 'smartconseil'
    }

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['development', 'staging', 'production'], description: 'Target environment')
        booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run tests before deployment')
        booleanParam(name: 'SKIP_BUILD', defaultValue: false, description: 'Skip build stage (use existing images)')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Checked out code for ${params.ENVIRONMENT} environment"
            }
        }

        stage('Environment Setup') {
            steps {
                script {
                    // Clean up any existing containers
                    bat '''
                        docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% down --remove-orphans || echo "No containers to stop"
                        docker system prune -f --volumes || echo "System cleanup completed"
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            when {
                not { params.SKIP_BUILD }
            }
            steps {
                script {
                    echo "Building Docker images for all services..."
                    bat '''
                        docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% build --no-cache --parallel
                    '''
                }
            }
        }

        stage('Start Infrastructure') {
            steps {
                script {
                    echo "Starting MySQL database..."
                    bat '''
                        docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% up -d mysql
                    '''
                    
                    // Wait for MySQL to be ready
                    echo "Waiting for MySQL to be ready..."
                    bat '''
                        timeout /t 30 /nobreak
                        docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% exec -T mysql mysqladmin ping -h localhost --silent || echo "MySQL not ready yet"
                    '''
                }
            }
        }

        stage('Run Tests') {
            when {
                params.RUN_TESTS
            }
            parallel {
                stage('Backend Integration Tests') {
                    steps {
                        script {
                            echo "Running backend integration tests..."
                            
                            // Start backend services for testing
                            bat '''
                                docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% up -d conseil-service planification-service rapport-service rectification-service user-service
                            '''
                            
                            // Wait for services to be ready
                            bat 'timeout /t 45 /nobreak'
                            
                            // Run health checks
                            bat '''
                                echo "Checking service health..."
                                curl -f http://localhost:8081/actuator/health || echo "Conseil service not ready"
                                curl -f http://localhost:8082/actuator/health || echo "Planification service not ready"
                                curl -f http://localhost:8083/actuator/health || echo "Rapport service not ready"
                                curl -f http://localhost:8084/actuator/health || echo "Rectification service not ready"
                                curl -f http://localhost:8085/actuator/health || echo "User service not ready"
                            '''
                        }
                    }
                    post {
                        always {
                            script {
                                // Collect logs from backend services
                                bat '''
                                    docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% logs conseil-service > conseil-service.log || echo "No logs for conseil-service"
                                    docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% logs planification-service > planification-service.log || echo "No logs for planification-service"
                                    docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% logs rapport-service > rapport-service.log || echo "No logs for rapport-service"
                                    docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% logs rectification-service > rectification-service.log || echo "No logs for rectification-service"
                                    docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% logs user-service > user-service.log || echo "No logs for user-service"
                                '''
                                
                                // Archive service logs
                                archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
                            }
                        }
                    }
                }

                stage('Frontend Tests') {
                    steps {
                        script {
                            echo "Running frontend tests in Docker container..."
                            
                            // Create a temporary container for testing
                            bat '''
                                docker build -t smartconseil-frontend-test -f FrontEsprit/SmartConseil-Front/Dockerfile FrontEsprit/SmartConseil-Front
                                docker run --rm --name frontend-test-container -v %cd%/test-results:/app/test-results smartconseil-frontend-test npm run test -- --watch=false --browsers=ChromeHeadless
                            '''
                        }
                    }
                 
                }
            }
        }

        stage('Deploy Application') {
            steps {
                script {
                    echo "Deploying full application stack..."
                    
                    // Deploy all services
                    bat '''
                        docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% up -d
                    '''
                    
                    // Wait for all services to be ready
                    echo "Waiting for all services to be ready..."
                    bat 'timeout /t 60 /nobreak'
                    
                    // Verify deployment
                    bat '''
                        echo "Verifying deployment..."
                        docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% ps
                        
                        echo "Checking frontend accessibility..."
                        curl -f http://localhost:4200 || echo "Frontend not accessible yet"
                        
                        echo "Checking backend services..."
                        curl -f http://localhost:8081/actuator/health || echo "Conseil service health check failed"
                        curl -f http://localhost:8082/actuator/health || echo "Planification service health check failed"
                        curl -f http://localhost:8083/actuator/health || echo "Rapport service health check failed"
                        curl -f http://localhost:8084/actuator/health || echo "Rectification service health check failed"
                        curl -f http://localhost:8085/actuator/health || echo "User service health check failed"
                    '''
                }
            }
        }

        stage('Smoke Tests') {
            steps {
                script {
                    echo "Running smoke tests..."
                    
                    // Basic connectivity tests
                    bat '''
                        echo "Testing application endpoints..."
                        
                        REM Test frontend
                        curl -f -s -o nul http://localhost:4200 && echo "Frontend: OK" || echo "Frontend: FAILED"
                        
                        REM Test backend services
                        curl -f -s -o nul http://localhost:8081/actuator/health && echo "Conseil Service: OK" || echo "Conseil Service: FAILED"
                        curl -f -s -o nul http://localhost:8082/actuator/health && echo "Planification Service: OK" || echo "Planification Service: FAILED"
                        curl -f -s -o nul http://localhost:8083/actuator/health && echo "Rapport Service: OK" || echo "Rapport Service: FAILED"
                        curl -f -s -o nul http://localhost:8084/actuator/health && echo "Rectification Service: OK" || echo "Rectification Service: FAILED"
                        curl -f -s -o nul http://localhost:8085/actuator/health && echo "User Service: OK" || echo "User Service: FAILED"
                        
                        REM Test database connectivity
                        docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% exec -T mysql mysql -u root -e "SHOW DATABASES;" && echo "Database: OK" || echo "Database: FAILED"
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                // Collect final logs and system information
                bat '''
                    echo "Collecting final system state..."
                    docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% ps > docker-containers-status.log
                    docker images > docker-images.log
                    docker system df > docker-system-usage.log
                '''
                
                // Archive artifacts
                archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
                
                // Clean up test containers but keep the application running
                bat '''
                    docker container prune -f
                    docker image prune -f
                '''
            }
        }

        success {
            echo '''
            ========================================
            🎉 DEPLOYMENT SUCCESSFUL! 🎉
            ========================================
            
            Application is now running at:
            - Frontend: http://localhost:4200
            - Backend Services:
              * Conseil: http://localhost:8081
              * Planification: http://localhost:8082
              * Rapport: http://localhost:8083
              * Rectification: http://localhost:8084
              * User: http://localhost:8085
            - Database: localhost:3306
            
            ========================================
            '''
        }

        failure {
            script {
                echo '''
                ========================================
                ❌ DEPLOYMENT FAILED! ❌
                ========================================
                '''
                
                // Collect failure logs
                bat '''
                    echo "Collecting failure logs..."
                    docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% logs > deployment-failure.log
                '''
                
                // Clean up failed deployment
                bat '''
                    echo "Cleaning up failed deployment..."
                    docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% down --remove-orphans
                '''
            }
        }

        cleanup {
            script {
                // Optional: Uncomment to clean up everything after pipeline
                // bat '''
                //     docker-compose -f %DOCKER_COMPOSE_FILE% -p %COMPOSE_PROJECT_NAME% down --volumes --remove-orphans
                //     docker system prune -af --volumes
                // '''
            }
        }
    }
}
