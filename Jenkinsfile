pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Backend Services') {
            parallel {
                stage('Build Conseil Service') {
                    steps {
                        dir('BackEsprit/SmartConseil-Back/microservices/microserviceConseil') {
                            bat 'mvn clean package -DskipTests'
                        }
                    }
                }
                
                stage('Build Planification Service') {
                    steps {
                        dir('BackEsprit/SmartConseil-Back/microservices/microservicePlanification') {
                            bat 'mvn clean package -DskipTests'
                        }
                    }
                }
                
                stage('Build Rapport Service') {
                    steps {
                        dir('BackEsprit/SmartConseil-Back/microservices/microserviceRapport') {
                            bat 'mvn clean package -DskipTests'
                        }
                    }
                }
                
                stage('Build Rectification Service') {
                    steps {
                        dir('BackEsprit/SmartConseil-Back/microservices/microserviceRectification') {
                            bat 'mvn clean package -DskipTests'
                        }
                    }
                }
                
                stage('Build User Service') {
                    steps {
                        dir('BackEsprit/SmartConseil-Back/microservices/microserviceUser') {
                            bat 'mvn clean package -DskipTests'
                        }
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('FrontEsprit/SmartConseil-Front') {
                    bat 'npm ci'
                    bat 'npm run build'
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
                            junit '**/target/surefire-reports/*.xml'
                        }
                    }
                }
                
                stage('Frontend Tests') {
                    steps {
                        dir('FrontEsprit/SmartConseil-Front') {
                            bat 'npm run test -- --watch=false --browsers=ChromeHeadless'
                        }
                    }
                    post {
                        always {
                            junit '**/test-results.xml'
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: '**/target/*.jar', allowEmptyArchive: true
            archiveArtifacts artifacts: '**/dist/**', allowEmptyArchive: true
        }
        
        success {
            echo 'Pipeline succeeded!'
        }
        
        failure {
            echo 'Pipeline failed!'
        }
    }
}
