pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 25, unit: 'MINUTES')
    }

    environment {
        PIP_DISABLE_PIP_VERSION_CHECK = '1'
        PYTHONDONTWRITEBYTECODE = '1'
    }

    stages {
        stage('Install') {
            steps {
                sh '''
                    npm install --no-audit --no-fund
                    python3 -m venv .venv
                    .venv/bin/python -m pip install -r requirements-dev.txt
                '''
            }
        }

        stage('Build and validate') {
            steps {
                sh '''
                    npm run build
                    npm run validate
                    .venv/bin/python -m compileall -q tests/python scripts/smoke_test.py
                '''
            }
        }

        stage('Core tests') {
            parallel {
                stage('Node') {
                    steps {
                        sh 'node --test --test-reporter=junit --test-reporter-destination=reports/generated/node-junit.xml tests/node/*.test.js'
                    }
                }
                stage('Python') {
                    steps {
                        sh '.venv/bin/python -m pytest -m "not browser" --junitxml=reports/generated/pytest-junit.xml'
                    }
                }
                stage('BDD') {
                    steps {
                        sh 'npm run test:cucumber'
                    }
                }
            }
        }

        stage('API collection') {
            steps {
                sh 'npm run test:postman'
            }
        }

        stage('Container smoke') {
            steps {
                sh '''
                    docker build -t release-readiness-lab:${BUILD_NUMBER} .
                    docker run -d --rm --name release-readiness-${BUILD_NUMBER} -p 14173:4173 release-readiness-lab:${BUILD_NUMBER}
                    trap 'docker stop release-readiness-${BUILD_NUMBER} >/dev/null 2>&1 || true' EXIT
                    for attempt in 1 2 3 4 5 6 7 8 9 10; do
                        curl --fail --silent http://127.0.0.1:14173/api/health && break
                        sleep 2
                    done
                    .venv/bin/python scripts/smoke_test.py --base-url http://127.0.0.1:14173
                '''
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'reports/generated/*-junit.xml'
            archiveArtifacts allowEmptyArchive: true, artifacts: 'api/openapi.*,reports/generated/**'
            cleanWs(deleteDirs: true, disableDeferredWipeout: true)
        }
    }
}
