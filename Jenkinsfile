pipeline {
    agent any

    tools {
        maven 'Maven3'       // Configure Maven dans Jenkins (Manage Jenkins > Global Tool Configuration)
        jdk 'JDK22'          // Configure ton JDK dans Jenkins (ex: JDK 17 ou 21)
        nodejs 'Node16'      // Configure Node.js pour le frontend
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
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
                            bat 'mvn clean package -DskipTests'
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('FrontEsprit/SmartConseil-Front') {
                    bat 'npm install'
                    bat 'npm run build -- --prod'
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
            archiveArtifacts artifacts: 'FrontEsprit/SmartConseil-Front/dist/**', allowEmptyArchive: true
        }
        success {
            echo '✅ Pipeline succeeded!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
