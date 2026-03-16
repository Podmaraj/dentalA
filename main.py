
import sys


def main():
    """Run the dental appointment system."""
    if "--server" in sys.argv or len(sys.argv) == 1:
        # Start FastAPI server (default)
        import uvicorn
        print("🦷 Starting Dental Appointment API Server...")
        print("   Frontend: http://localhost:3000")
        print("   API Docs: http://localhost:8000/docs")
        print("   Press Ctrl+C to stop\n")
        uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
    elif "--cli" in sys.argv:
        # Interactive CLI mode
        from dental_agent.agent import run_agent
        print("🦷 Dental Appointment Assistant (CLI Mode)")
        print("   Type 'quit' to exit\n")
        history = []
        while True:
            user_input = input("You: ").strip()
            if user_input.lower() in ("quit", "exit", "bye"):
                print("Agent: Goodbye! Take care of your teeth! 🦷")
                break
            if not user_input:
                continue

            response = run_agent(user_input, history)
            print(f"Agent: {response}\n")

            history.append({"role": "user", "content": user_input})
            history.append({"role": "assistant", "content": response})


if __name__ == "__main__":
    main()
