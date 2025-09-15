pipeline {
    agent any

    parameters {
        string(name: 'DB_URL', defaultValue: 'jdbc:mysql://localhost:3306/conseil?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true', description: 'Database URL for testing')
        string(name: 'DB_USERNAME', defaultValue: 'root', description: 'Database username for testing')
        password(name: 'DB_PASSWORD', defaultValue: '', description: 'Database password for testing')
    }

    environment {
        SONAR_TOKEN = credentials('sonarqube') // token enregistré dans Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Services') {
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
                // Analyse chaque microservice
                dir('BackEsprit/SmartConseil-Back/microservices/microservicePlanification') {
                    withSonarQubeEnv('MySonarQube') {
                        bat "mvn sonar:sonar -Dsonar.login=%SONAR_TOKEN%"
                    }
                }
                dir('BackEsprit/SmartConseil-Back/microservices/microserviceRapport') {
                    withSonarQubeEnv('MySonarQube') {
                        bat "mvn sonar:sonar -Dsonar.login=%SONAR_TOKEN%"
                    }
                }
                dir('BackEsprit/SmartConseil-Back/microservices/microserviceRectification') {
                    withSonarQubeEnv('MySonarQube') {
                        bat "mvn sonar:sonar -Dsonar.login=%SONAR_TOKEN%"
                    }
                }
                dir('BackEsprit/SmartConseil-Back/microservices/microserviceUser') {
                    withSonarQubeEnv('MySonarQube') {
                        bat "mvn sonar:sonar -Dsonar.login=%SONAR_TOKEN%"
                    }
                }
                dir('BackEsprit/SmartConseil-Back/microservices/microserviceConseil') {
                    withSonarQubeEnv('MySonarQube') {
                        bat "mvn sonar:sonar -Dsonar.login=%SONAR_TOKEN%"
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
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
