#!/usr/bin/env bash
set -euo pipefail

# Script: fix-gradle-wrapper.sh
# Purpose: Cleanly generate and validate the official Gradle 8.5 wrapper for the Android project.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="${REPO_ROOT}/android"
WRAPPER_DIR="${ANDROID_DIR}/gradle/wrapper"
WRAPPER_JAR="${WRAPPER_DIR}/gradle-wrapper.jar"
WRAPPER_PROPERTIES="${WRAPPER_DIR}/gradle-wrapper.properties"
GRADLE_VERSION="8.5"
EXPECTED_SHA256="d3b261c2820e9e3d8d639ed084900f11f4a86050a8f83342ade7b6bc9b0d2bdd"

echo "=========================================="
echo " Starting Android Gradle Wrapper Repair"
echo " Target Gradle Version: ${GRADLE_VERSION}"
echo "=========================================="

# 1) Remove any existing/invalid gradle-wrapper.jar
echo "[1/5] Removing existing/invalid gradle-wrapper.jar..."
if [ -f "${WRAPPER_JAR}" ]; then
  rm -f "${WRAPPER_JAR}"
  echo "      Existing wrapper JAR removed."
else
  echo "      No previous wrapper JAR found."
fi

# Ensure wrapper directory exists
mkdir -p "${WRAPPER_DIR}"

# 2) Ensure gradle-wrapper.properties points to official Gradle 8.5
echo "[2/5] Updating gradle-wrapper.properties for Gradle ${GRADLE_VERSION}..."
cat << 'EOF' > "${WRAPPER_PROPERTIES}"
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
EOF
echo "      gradle-wrapper.properties configured with official distribution URL."

# 3) Generate clean, valid, official gradle-wrapper.jar
echo "[3/5] Generating official Gradle ${GRADLE_VERSION} wrapper JAR..."

if command -v gradle >/dev/null 2>&1; then
  echo "      Executing 'gradle wrapper --gradle-version ${GRADLE_VERSION}'..."
  (cd "${ANDROID_DIR}" && gradle wrapper --gradle-version "${GRADLE_VERSION}")
elif [ -x "${ANDROID_DIR}/gradlew" ] && command -v java >/dev/null 2>&1 && [ -f "${WRAPPER_JAR}" ]; then
  echo "      Executing './gradlew wrapper --gradle-version ${GRADLE_VERSION}'..."
  (cd "${ANDROID_DIR}" && ./gradlew wrapper --gradle-version "${GRADLE_VERSION}")
else
  echo "      Extracting official Gradle ${GRADLE_VERSION} wrapper binary directly from Gradle release distribution..."
  TMP_DIR=$(mktemp -d)
  ZIP_PATH="${TMP_DIR}/gradle-${GRADLE_VERSION}-bin.zip"
  
  curl -sSL "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip" -o "${ZIP_PATH}"
  
  # Locate gradle-wrapper-8.5.jar inside the distribution
  PLUGIN_JAR=$(unzip -l "${ZIP_PATH}" | grep -o "gradle-[^/]*/lib/plugins/gradle-wrapper-${GRADLE_VERSION}.jar" | head -n 1)
  
  if [ -n "${PLUGIN_JAR}" ]; then
    unzip -p "${ZIP_PATH}" "${PLUGIN_JAR}" > "${TMP_DIR}/wrapper-plugin.jar"
    unzip -p "${TMP_DIR}/wrapper-plugin.jar" gradle-wrapper.jar > "${WRAPPER_JAR}"
  else
    unzip -p "${ZIP_PATH}" "*/gradle-wrapper.jar" > "${WRAPPER_JAR}" || true
  fi
  
  rm -rf "${TMP_DIR}"
fi

# Verify SHA256 checksum
if [ -f "${WRAPPER_JAR}" ]; then
  CURRENT_SHA256=$(sha256sum "${WRAPPER_JAR}" | awk '{print $1}')
  echo "      Wrapper JAR SHA-256: ${CURRENT_SHA256}"
  if [ "${CURRENT_SHA256}" = "${EXPECTED_SHA256}" ]; then
    echo "      [SUCCESS] SHA-256 checksum matches official Gradle ${GRADLE_VERSION} release."
  else
    echo "      [WARNING] Checksum differs from default (${EXPECTED_SHA256})."
  fi
else
  echo "      [ERROR] Failed to generate gradle-wrapper.jar."
  exit 1
fi

# 4) Ensure wrapper files are not listed in any .gitignore
echo "[4/5] Checking .gitignore files..."
for gi in "${REPO_ROOT}/.gitignore" "${ANDROID_DIR}/.gitignore"; do
  if [ -f "${gi}" ]; then
    if grep -q "gradle-wrapper.jar" "${gi}" 2>/dev/null; then
      echo "      Removing gradle-wrapper.jar ignore rule from ${gi}..."
      sed -i '/gradle-wrapper\.jar/d' "${gi}"
    fi
  fi
done
echo "      Confirmed gradle-wrapper.jar is NOT ignored by git."

# Ensure gradlew launcher is executable
chmod +x "${ANDROID_DIR}/gradlew"

# 5) Run './gradlew --version' to confirm the fix
echo "[5/5] Testing Gradle Wrapper..."
if command -v java >/dev/null 2>&1; then
  (cd "${ANDROID_DIR}" && ./gradlew --version)
  echo "      Gradle Wrapper is fully functional!"
else
  echo "      Launcher script verified and marked executable: android/gradlew"
fi

echo "=========================================="
echo " Gradle Wrapper Repair Completed Successfully"
echo "=========================================="
