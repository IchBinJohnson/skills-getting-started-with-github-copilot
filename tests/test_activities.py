def test_root_redirects_to_static_index(client, fresh_activities):
    # Arrange
    url = "/"

    # Act
    response = client.get(url, follow_redirects=False)

    # Assert
    assert response.status_code in (302, 307)
    assert response.headers["location"] == "/static/index.html"


def test_get_activities_returns_data(client, fresh_activities):
    # Arrange
    endpoint = "/activities"

    # Act
    response = client.get(endpoint)
    data = response.json()

    # Assert
    assert response.status_code == 200
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]
    assert isinstance(data["Chess Club"]["participants"], list)


def test_get_activities_sets_no_cache_headers(client, fresh_activities):
    # Arrange
    endpoint = "/activities"

    # Act
    response = client.get(endpoint)

    # Assert
    assert response.status_code == 200
    assert "no-store" in response.headers["cache-control"]
    assert response.headers["pragma"] == "no-cache"
    assert response.headers["expires"] == "0"
