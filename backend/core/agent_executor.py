from tools.llm import llm

from utils.json_parser import parse_json


def run_agent(system_prompt, user_input):

    response = llm.invoke([
        ("system", system_prompt),
        ("human", user_input),
    ])

    data = parse_json(response.content)

    return data, response.content