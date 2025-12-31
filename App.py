import streamlit as st
import google.generativeai as genai
import time

# --- 1. CONFIGURATION & STATE INITIALIZATION ---
st.set_page_config(page_title="HPSC Geo-Prep", layout="wide")

# This replaces React's 'useState' hooks
if "messages" not in st.session_state:
    st.session_state.messages = []
if "user" not in st.session_state:
    st.session_state.user = None
if "current_mode" not in st.session_state:
    st.session_state.current_mode = "Syllabus Decoder"
if "api_key_valid" not in st.session_state:
    st.session_state.api_key_valid = False

# --- 2. AUTHENTICATION SERVICE (Mock DB) ---
# Replaces your handleLogin logic
USERS = {
    "student": {"password": "123", "role": "Student", "profile": "Fresher", "username": "Student User"},
    "admin": {"password": "admin", "role": "Admin", "profile": "N/A", "username": "Admin User"}
}

def authenticate(username, password):
    if username in USERS and USERS[username]["password"] == password:
        return USERS[username]
    return None

# --- 3. GEMINI SERVICE (Replaces geminiService.ts) ---
def get_gemini_response(history, user_input, mode, user_profile):
    # Try to get the API key from Streamlit Secrets (Environment Variable)
    try:
        api_key = st.secrets["GOOGLE_API_KEY"]
        genai.configure(api_key=api_key)
        
        # System Prompt construction based on Mode and Profile
        system_instruction = f"""
        ACT AS: HPSC Geography Mentor.
        CONTEXT: User is a {user_profile}.
        CURRENT MODE: {mode}
        
        INSTRUCTIONS:
        - Syllabus Decoder: Explain concepts academically.
        - Interview Simulator: Act as a panel. Ask one question at a time.
        - Haryana Contextualizer: Connect global concepts to Haryana geography.
        """
        
        # Create the model
        model = genai.GenerativeModel('gemini-1.5-pro', system_instruction=system_instruction)
        
        # Build chat history for Gemini format
        chat_history = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            chat_history.append({"role": role, "parts": [msg["text"]]})
            
        chat = model.start_chat(history=chat_history)
        response = chat.send_message(user_input)
        return response.text
        
    except Exception as e:
        return f"Error connecting to AI: {str(e)}"

# --- 4. UI COMPONENTS (Views) ---

def login_screen():
    # Replaces <LoginScreen />
    col1, col2, col3 = st.columns([1,2,1])
    with col2:
        st.title("🔐 HPSC Prep Login")
        with st.form("login_form"):
            username = st.text_input("Username")
            password = st.text_input("Password", type="password")
            submitted = st.form_submit_button("Login")
            
            if submitted:
                user_data = authenticate(username, password)
                if user_data:
                    st.session_state.user = user_data
                    # Set default mode based on role (Logic from your handleLogin)
                    if user_data['role'] == 'Admin':
                        st.session_state.current_mode = "Admin Dashboard"
                    else:
                        st.session_state.current_mode = "Syllabus Decoder"
                    st.rerun()
                else:
                    st.error("Invalid credentials (Try: student / 123)")

def sidebar_component():
    # Replaces <Sidebar />
    with st.sidebar:
        st.header(f"👤 {st.session_state.user['username']}")
        st.caption(f"Profile: {st.session_state.user['profile']}")
        
        st.divider()
        
        # Mode Options
        options = ["Syllabus Decoder", "Interview Simulator", "Haryana Contextualizer"]
        if st.session_state.user['role'] == "Admin":
            options.append("Admin Dashboard")
            options.append("Evaluation Lab")
            
        # Radio button acts as the Mode Switcher
        selected_mode = st.radio("Select Mode", options, index=options.index(st.session_state.current_mode) if st.session_state.current_mode in options else 0)
        
        # Handle Mode Change Logic (Replaces handleModeChange)
        if selected_mode != st.session_state.current_mode:
            st.session_state.current_mode = selected_mode
            st.session_state.messages = [] # Clear chat on switch
            
            # Welcome Message Logic from your React code
            welcome_text = ""
            if selected_mode == "Syllabus Decoder":
                welcome_text = f"Mode A Active: Syllabus Decoder. Which topic shall we analyze? ({st.session_state.user['profile']} Mode)"
            elif selected_mode == "Interview Simulator":
                welcome_text = f"Mode B Active: Interview Simulator. Type 'Ready' to begin. ({st.session_state.user['profile']} Mode)"
            elif selected_mode == "Haryana Contextualizer":
                welcome_text = f"Mode C Active: Connect geography concepts to Haryana. ({st.session_state.user['profile']} Mode)"
            
            if welcome_text:
                st.session_state.messages.append({"role": "model", "text": welcome_text})
            
            st.rerun()

        st.divider()
        if st.button("Logout"):
            st.session_state.user = None
            st.session_state.messages = []
            st.rerun()

def chat_interface():
    # Replaces <ChatInterface />
    st.subheader(f"📍 {st.session_state.current_mode}")
    
    # 1. Display History
    for msg in st.session_state.messages:
        avatar = "🧑‍💻" if msg["role"] == "user" else "🤖"
        with st.chat_message(msg["role"], avatar=avatar):
            st.markdown(msg["text"])
            
    # 2. Handle Input
    if prompt := st.chat_input("Type your answer or question here..."):
        # Add User Message
        st.session_state.messages.append({"role": "user", "text": prompt})
        with st.chat_message("user", avatar="🧑‍💻"):
            st.markdown(prompt)
            
        # Get AI Response
        with st.spinner("Thinking..."):
            response = get_gemini_response(
                st.session_state.messages[:-1], # Pass history excluding current prompt
                prompt,
                st.session_state.current_mode,
                st.session_state.user['profile']
            )
            
        # Add AI Message
        st.session_state.messages.append({"role": "model", "text": response})
        with st.chat_message("model", avatar="🤖"):
            st.markdown(response)

def admin_dashboard():
    # Replaces <AdminDashboard />
    st.title("📊 Admin Dashboard")
    st.success("Welcome, Admin. Here are the system metrics.")
    
    col1, col2, col3 = st.columns(3)
    col1.metric("Active Candidates", "42")
    col2.metric("Avg. Interview Score", "6.8/10")
    col3.metric("Top Weakness", "Haryana GK")
    
    st.write("Recent Activity Logs:")
    st.dataframe([
        {"User": "Student A", "Mode": "Interview", "Score": 8, "Time": "10:00 AM"},
        {"User": "Student B", "Mode": "Syllabus", "Score": "N/A", "Time": "10:15 AM"},
    ])

# --- 5. MAIN APP CONTROLLER ---
def main():
    # 1. Check API Key (Replaces ApiKeyModal check)
    if "GOOGLE_API_KEY" not in st.secrets:
        st.error("⚠️ Missing Google API Key. Please add it to Streamlit Secrets.")
        return

    # 2. Check Login State
    if not st.session_state.user:
        login_screen()
    else:
        # 3. Layout: Sidebar + Main Content
        sidebar_component()
        
        # Router
        if st.session_state.current_mode == "Admin Dashboard":
            admin_dashboard()
        elif st.session_state.current_mode == "Evaluation Lab":
            st.title("🧪 Evaluation Lab")
            st.info("Deep diagnostics module under construction.")
        else:
            chat_interface()

if __name__ == "__main__":
    main()
