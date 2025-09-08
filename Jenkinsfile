pipeline {
    agent any

    parameters {
        string(name: 'DB_URL', defaultValue: 'jdbc:mysql://localhost:3306/conseil?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true', description: 'Database URL for testing')
        string(name: 'DB_USERNAME', defaultValue: 'root', description: 'Database username for testing')
        password(name: 'DB_PASSWORD', defaultValue: '', description: 'Database password for testing')
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
                              
                                'microservicePlanification',
                                'microserviceRapport',
                                'microserviceRectification',
                                'microserviceUser'
                            ]

                            withCredentials([string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD_CRED')]) {
                                services.each { service ->
                                    dir("BackEsprit/SmartConseil-Back/microservices/${service}") {
                                        bat "mvn test -Dspring.datasource.url=${params.DB_URL} -Dspring.datasource.username=${params.DB_USERNAME} -Dspring.datasource.password=${DB_PASSWORD_CRED}"
                                    }
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
                            junit '**/test-results/test-results.xml'
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
