import re


def normalize_amount(value):

    if value is None:
        return None

    if isinstance(value, (int, float)):
        return float(value)

    value = str(value)

    value = re.sub(r"[₹,\s]", "", value)

    try:
        return float(value)
    except:
        return None