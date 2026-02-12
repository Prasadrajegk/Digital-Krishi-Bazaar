import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../../services/api"
import "../../styles/auth.css"

const Register = () => {
  const navigate = useNavigate()
  const [error, setError] = useState("")

  // 🌍 State & Division lists
  const [states, setStates] = useState([])
  const [divisions, setDivisions] = useState([])

  // 📋 Form data
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    stateId: "",
    divisionId: "", 
    gender: "",
    dob : ""
  })

  /* ======================
     LOAD STATES ON PAGE LOAD
     ====================== */
  useEffect(() => {
    api.get("/states")
      .then(res => setStates(res.data))
      .catch(err => console.error("Failed to load states", err))
  }, [])

  /* ======================
     HANDLE INPUT CHANGE
     ====================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  /* ======================
     HANDLE STATE CHANGE
     ====================== */
  const handleStateChange = async (e) => {
    const stateId = e.target.value

    setForm({
      ...form,
      stateId: stateId,
      divisionId: ""
    })

    if (stateId) {
      try {
        const res = await api.get(`/divisions/state/${stateId}`)
        setDivisions(res.data)
      } catch (err) {
        console.error("Failed to load divisions", err)
      }
    } else {
      setDivisions([])
    }
  }

  /* ======================
     HANDLE SUBMIT
     ====================== */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!form.stateId || !form.divisionId) {
      setError("Please select State and Division")
      return
    }

    try {
      await api.post("/users", {
        userName: form.name,
        email: form.email,
        password: form.password,
        mobile: form.mobile,
        address: form.address,
        stateId: form.stateId,
        divisionId: form.divisionId,
        gender: form.gender,
        dob: form.dob,
        status: "ACTIVE",
        credit: 0
      })

      navigate("/login")
    } catch (err) {
      setError("Registration failed")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

         <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
        >
          <option value="" disabled>Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>


          <input
            name="dob"
            placeholder="dob"
            type = "date"
            value={form.dob}
            onChange={handleChange}
          />

          <input
            name="mobile"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
          />

          {/* 🌍 STATE DROPDOWN */}
          <select
            name="stateId"
            value={form.stateId}
            onChange={handleStateChange}
          >
            <option value="">Select State</option>
            {states.map(state => (
              <option key={state.stateId} value={state.stateId}>
                {state.stateName}
              </option>
            ))}
          </select>

          {/* 🏙️ DIVISION DROPDOWN */}
          <select
            name="divisionId"
            value={form.divisionId}
            onChange={handleChange}
            disabled={!form.stateId}
          >
            <option value="">Select Division</option>
            {divisions.map(div => (
              <option key={div.divisionId} value={div.divisionId}>
                {div.divisionName}
              </option>
            ))}
          </select>

          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
          />

          <button className="auth-btn">Register</button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}

export default Register