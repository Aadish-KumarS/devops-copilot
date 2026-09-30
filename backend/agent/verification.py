from tools.incident_tools import verify_service


def verify_remediation(service="transit-api"):
    verification = verify_service(service)

    if verification["recovered"]:
        return {
            "verified": True,
            "status": "recovered",
            "verification": verification
        }

    return {
        "verified": False,
        "status": "recovery_failed",
        "verification": verification
    }