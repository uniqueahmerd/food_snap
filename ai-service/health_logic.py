def generate_advice(food_info, conditions):
    ingredients = [i.lower() for i in food_info["ingredients"]]
    fat = food_info["fat"]
    calories = food_info["calories"]
    carbs = food_info["carbs"]
    protein = food_info["protein"]

    risk_score = 0
    flags = []
    advice_parts = []

    for cond in conditions:
        if cond == "Diabetic":
            if "sugar" in ingredients or carbs > 40:
                risk_score += 30
                flags.append("High carb")
                advice_parts.append("Reduce starchy ingredients or use low-GI substitutes.")

        if cond == "Hypertensive":
            if "salt" in ingredients:
                risk_score += 20
                flags.append("Salt content")
                advice_parts.append("Avoid adding salt; use natural spices.")
            if fat > 25:
                risk_score += 15
                flags.append("High fat")

        if cond == "Weight Loss":
            if calories > 400:
                risk_score += 25
                flags.append("High calorie")
                advice_parts.append("Consider smaller portions or reduce oil usage.")

        if cond == "Malnourished":
            if protein < 10:
                risk_score += 15
                flags.append("Low protein")
                advice_parts.append("Add protein-rich sides like beans or eggs.")

        if cond == "Pregnant/Nursing":
            if protein < 10:
                risk_score += 10
                flags.append("Low protein for pregnancy")
                advice_parts.append("Increase protein with fish, legumes, or eggs.")

        if cond == "Cholesterol Watch":
            if "palm oil" in ingredients or fat > 25:
                risk_score += 20
                flags.append("Cholesterol risk")
                advice_parts.append("Avoid palm oil and fried foods.")

    if not advice_parts:
        advice_parts.append("No major risks detected. Enjoy in moderation.")

    advice = " ".join(set(advice_parts))
    return advice, min(risk_score, 100), flags
