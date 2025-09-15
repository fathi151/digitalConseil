pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Microservices') {
            parallel {
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
                stage('Build Conseil Service') {
                    steps {
                        dir('BackEsprit/SmartConseil-Back/microservices/microserviceConseil') {
                            bat 'mvn clean package -DskipTests'
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def microservices = [
                        "microservicePlanification",
                        "microserviceRapport",
                        "microserviceRectification",
                        "microserviceUser",
                        "microserviceConseil"
                    ]

                    microservices.each { svc ->
                        dir("BackEsprit/SmartConseil-Back/microservices/${svc}") {
                            def sonarUrl = "http://localhost:9000"
                            def sonarToken = "sqp_f92b65d7ecb5a4a140ba0a4c37508c8a2bbac44a"
                            bat """
                                mvn sonar:sonar ^
                                  -Dsonar.projectKey=${svc} ^
                                  -Dsonar.host.url=${sonarUrl} ^
                                  -Dsonar.login=${sonarToken}
                            """
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

        stage('Build Docker Images') {
            steps {
                bat 'docker-compose -f docker-compose.yml build'
            }
        }

        stage('Run with Docker Compose') {
            steps {
                bat 'docker-compose -f docker-compose.yml up -d'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline succeeded!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
