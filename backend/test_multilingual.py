from agents.intake import intake_agent
from test_case import TEST_CASES

for i, complaint in enumerate(TEST_CASES, start=1):

    print("\n")
    print("=" * 80)
    print(f"TEST CASE {i}")
    print("=" * 80)

    state = {
        "complaint": complaint
    }

    result = intake_agent(state)

    print("\nExtracted State")

    print(result)