def test_signup_adds_participant(client, fresh_activities):
    # Arrange
    activity = "Chess Club"
    email = "new.student@mergington.edu"

    # Act
    response = client.post(f"/activities/{activity}/signup", params={"email": email})

    # Assert
    assert response.status_code == 200
    assert email in fresh_activities[activity]["participants"]


def test_signup_rejects_duplicate_participant(client, fresh_activities):
    # Arrange
    activity = "Chess Club"
    duplicate_email = fresh_activities[activity]["participants"][0]

    # Act
    response = client.post(
        f"/activities/{activity}/signup", params={"email": duplicate_email}
    )

    # Assert
    assert response.status_code == 400
    assert response.json()["detail"] == "Student already signed up"


def test_signup_returns_404_for_unknown_activity(client, fresh_activities):
    # Arrange
    unknown_activity = "Unknown Club"

    # Act
    response = client.post(
        f"/activities/{unknown_activity}/signup", params={"email": "student@x.edu"}
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_unregister_removes_participant(client, fresh_activities):
    # Arrange
    activity = "Chess Club"
    email = fresh_activities[activity]["participants"][0]

    # Act
    response = client.delete(
        f"/activities/{activity}/participants", params={"email": email}
    )

    # Assert
    assert response.status_code == 200
    assert email not in fresh_activities[activity]["participants"]


def test_unregister_returns_404_for_missing_participant(client, fresh_activities):
    # Arrange
    activity = "Chess Club"
    email = "not-registered@mergington.edu"

    # Act
    response = client.delete(
        f"/activities/{activity}/participants", params={"email": email}
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Student not registered for this activity"
