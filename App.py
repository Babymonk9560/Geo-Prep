import streamlit as st
import google.generativeai as genai
import time

# --- 1. CONFIGURATION & STATE SETUP ---
st.set_page_config(page_title="HPSC Geo-Prep", layout="wide")

# Initialize Session State (This replaces React's useState)
if "messages" not in st.session_state:
    st.session_state.messages = []
if "user" not in st.session_state:
    st.session_state.user = None
if "current_mode" not in st.session_state:
    st.session_state.current_mode = "Syllabus Decoder"

# --- 2. DUMMY AUTHENTICATION (Replaces LoginScreen component) ---
# In a real app, you would connect this to your database
USERS = {
    "student": {"password": "123", "role": "Student", "profile": "Fresher"},
    "admin": {"password": "admin", "role": "Admin", "profile": "N/A"}
}

def authenticate(username, password):
    if username in USERS and USERS[username]["password"] == password:
        return {"username": username, **USERS[username]}
    return None

# --- 3. GEMINI SERVICE (Replaces sendMessageToGemini) ---
def get_ai_response(prompt, mode, profile):
    # Access API Key securely from Streamlit Secrets
    try:
        api_key = st.secrets["GOOGLE_API_KEY"]
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Dynamic System Prompt based on Mode
        system_instruction = f"""
        Role: HPSC Geography Mentor.
        User Profile: {profile}
        Current Mode: {mode}
        
        INSTRUCTIONS:
        - If mode is 'Syllabus Decoder': Explain the concept academically with HPSC relevance.
        - If mode is 'Interview Simulator': Act as a panel. Ask one tough question at a time.
        - If mode is 'Haryana Contextualizer': Connect the user's topic to Haryana state geography.
        """
        
        full_prompt = f"{system_instruction}\n\nUser Input: {prompt}"
        response = model.generate_content(full_prompt)
        return response.text
        
    except Exception as e:
        return f"Error: Could not connect to Gemini. Check your API Key. ({str(e)})"

# --- 4. UI COMPONENTS ---

def login_screen():
    st.title("🔐 HPSC Geography Mentor")
    st.write("Please log in to continue.")
    
    with st.form("login_form"):
        col1, col2 = st.columns(2)
        username = col1.text_input("Username (Try: student)")
        password = col2.text_input("Password (Try: 123)", type="password")
        submitted = st.form_submit_button("Login")
        
        if submitted:
            user = authenticate(username, password)
            if user:
                st.session_state.user = user
                st.success("Login Successful!")
                st.rerun() # Refresh app to show the main interface
            else:
                st.error("Invalid Username or Password")

def sidebar():
    with st.sidebar:
        st.header(f"👤 {st.session_state.user['username']}")
        st.caption(f"Role: {st.session_state.user['role']}")
        
        st.divider()
        
        # Mode Selection (Replaces AppMode logic)
        modes = ["Syllabus Decoder", "Interview Simulator", "Haryana Contextualizer"]
        if st.session_state.user['role'] == "Admin":
            modes.append("Admin Dashboard")
            modes.append("Evaluation Lab")
            
        selected_mode = st.radio("Select Preparation Mode", modes)
        
        # Handle Mode Switching (Clear chat if mode changes)
        if selected_mode != st.session_state.current_mode:
            st.session_state.current_mode = selected_mode
            st.session_state.messages = [] # Clear history
            st.rerun()
            
        st.divider()
        if st.button("Logout"):
            st.session_state.user = None
            st.session_state.messages = []
            st.rerun()

def chat_interface():
    st.subheader(f"📍 {st.session_state.current_mode}")
    
    # Display Chat History
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["text"])

    # Chat Input
    if prompt := st.chat_input("Type here..."):
        # 1. Add User Message
        st.session_state.messages.append({"role": "user", "text": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
            
        # 2. Get AI Response
        with st.spinner("AI is thinking..."):
            ai_reply = get_ai_response(
                prompt, 
                st.session_state.current_mode, 
                st.session_state.user['profile']
            )
        
        # 3. Add AI Message
        st.session_state.messages.append({"role": "assistant", "text": ai_reply})
        with st.chat_message("assistant"):
            st.markdown(ai_reply)

def admin_dashboard():
    st.title("📊 Admin Dashboard")
    st.info("Admin View: Student Performance Metrics")
    
    # Placeholder Analytics
    col1, col2, col3 = st.columns(3)
    col1.metric("Active Students", "12")
    col2.metric("Avg Score", "7.5/10")
    col3.metric("Weakest Topic", "Geomorphology")
    
    st.bar_chart({"Topic A": 30, "Topic B": 70, "Topic C": 45})

# --- 5. MAIN APP LOGIC ---
if not st.session_state.user:
    login_screen()
else:
    sidebar()
    
    # Render view based on mode
    if st.session_state.current_mode == "Admin Dashboard":
        admin_dashboard()
    elif st.session_state.current_mode == "Evaluation Lab":
        st.title("🧪 Evaluation Lab")
        st.write("Deep diagnostics feature coming soon.")
    else:
        chat_interface()
