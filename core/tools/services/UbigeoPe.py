import json
import os

class UbigeoPe:
    def getAllUbigeos():
        curr_dir = os.path.dirname(os.path.abspath(__file__))
        with open(f"{curr_dir}/UbigeoPe.json", 'r', encoding='utf-8') as arq:
            data = json.load(arq)
            return data
    
    def consultDepartment():
        pass
    
    def consultProvince():
        pass
    
    def consultDistrict():
        pass

# api = UbigeoPe
# data = api.getAllUbigeos()
# print(data)
