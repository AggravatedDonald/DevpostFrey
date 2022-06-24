from bs4 import BeautifulSoup
import requests


def scrape(location="", age="All", purpose="All"):
    info = []
    url = f"https://www.neefusa.org/npld-event-search-results?field_event_participation_value=All&field_geofield_distance%5Bdistance%5D=100&field_geofield_distance%5Bunit%5D=3959&field_geofield_distance%5Borigin%5D={location}&field_proximity_radius=250&field_date_and_time_value%5Bvalue%5D%5Bdate%5D=Wednesday%2C+June+1%2C+2022&field_date_and_time_value2%5Bvalue%5D%5Bdate%5D=Wednesday%2C+September+21%2C+2022&combine=&field_event_activities_value={purpose}&field_intended_audience_value={age}&field_type_of_training_tid=All"
    doc = requests.get(url).text
    soup = BeautifulSoup(doc, "html.parser")
    events_div = soup.find("div", class_="view view-event-locator-npld view-id-event_locator_npld view-display-id-attachment_2 event-details")
    events_div = events_div.findChild('div', "view-content")
    if events_div == None:
        return False
    events = events_div.findChildren('div', recursive=False)
    for event in events:
        # print("-------------------------------")
        event_details = event.find("div", class_="event-description")
        name = event_details.find("h4").text
        event_link = event_details.find("div", class_="field-link").find('a')['href']
        new_doc = requests.get("https://www.neefusa.org"+ event_link).text
        new_soup = BeautifulSoup(new_doc, "html.parser")
        event_details = new_soup.find("article").findChild("div", "content clearfix")
        event_paragraph = event_details.findChild("div", "field field-name-field-event-description field-type-text-long field-label-hidden").findChild("div").findChild("div").text #NEED
        event_date_div = event_details.findChild("div", "field field-name-field-date-and-time field-type-datetime field-label-above")
        date = event_date_div.find("span").text #NEED
        time_start = event_date_div.find("span", class_="date-display-start").text #NEED
        time_end = event_date_div.find("span", class_="date-display-end").text #NEED
        location_div = event_details.findChild("div", "field field-name-field-address field-type-addressfield field-label-above")
        location = location_div.findChild("div", "field-item even").text #NEED
        host_links = event_details.findChild("div", "event-social-links").findChildren("div", recursive=False)
        links = []
        for link in host_links:
            link = link.find("a")["href"]
            links.append(link)

        
        org_name = event_details.findChild("div", "field field-name-field-organization field-type-text field-label-hidden")
        if org_name != None:
            org_name = org_name.text
        contact_title = event_details.findChild("div", "field field-name-field-job-title field-type-text field-label-hidden")
        if contact_title != None:
            contact_title = contact_title.text
        contact_email = event_details.findChild("div", "field field-name-field-email-address field-type-email field-label-hidden")
        if contact_email != None:
            contact_email = contact_email.text
        contact_phone = event_details.findChild("div", "field field-name-field-phone-number-text field-type-text field-label-hidden")
        if contact_phone != None:
            contact_phone = contact_phone.text
        contact_name = event_details.findChild("div", "strong")
        if contact_name != None:
            contact_name = contact_name.text
        info.append({"event_name": name, "event_desc": event_paragraph, "date": date, "host_links": links, "org_name": org_name, "contact_title": contact_title, "contact_email": contact_email, "contact_phone": contact_phone, "contact_name": contact_name})
    
    return info

        
