from __future__ import annotations

import os

import pytest

pytestmark = pytest.mark.browser
selenium = pytest.importorskip("selenium")

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def test_user_can_filter_and_open_release_details(base_url: str) -> None:
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    if os.getenv("CHROME_BIN"):
        options.binary_location = os.environ["CHROME_BIN"]

    driver = webdriver.Chrome(options=options)
    try:
        driver.get(base_url)
        wait = WebDriverWait(driver, 10)
        wait.until(EC.text_to_be_present_in_element((By.ID, "release-count"), "3 releases"))

        driver.find_element(By.CSS_SELECTOR, "[data-status='blocked']").click()
        wait.until(EC.text_to_be_present_in_element((By.ID, "release-count"), "1 release"))
        assert driver.find_element(By.CSS_SELECTOR, ".release-name h3").text == "Cirrus"

        driver.find_element(By.CSS_SELECTOR, "[data-action='details']").click()
        dialog = wait.until(EC.visibility_of_element_located((By.ID, "release-dialog")))
        assert "Cirrus 2.3.1" in dialog.text
        assert "Open critical defect" in dialog.text
    finally:
        driver.quit()
