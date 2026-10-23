import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { resetCsrfToken } from "../../services/api";

export const fetchCurrentUser = createAsyncThunk(
  "auth/currentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/auth/me");
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Not authenticated",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/login", credentials);
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (details, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/register", details);
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/api/auth/logout");
      resetCsrfToken();
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    initialized: false,
    error: null,
  },
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    clearUser(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.initialized = true;
    });
    builder.addCase(fetchCurrentUser.rejected, (state) => {
      state.user = null;
      state.loading = false;
      state.initialized = true;
    });
    builder.addCase(logoutUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.loading = false;
      state.initialized = true;
    });
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Logout failed";
    });
    builder.addMatcher(
      (action) =>
        [loginUser.pending.type, registerUser.pending.type].includes(
          action.type,
        ),
      (state) => {
        state.loading = true;
        state.error = null;
      },
    );
    builder.addMatcher(
      (action) =>
        [loginUser.fulfilled.type, registerUser.fulfilled.type].includes(
          action.type,
        ),
      (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.initialized = true;
      },
    );
    builder.addMatcher(
      (action) =>
        [loginUser.rejected.type, registerUser.rejected.type].includes(
          action.type,
        ),
      (state, action) => {
        state.error = action.payload || "Authentication failed";
        state.loading = false;
      },
    );
  },
});

export const { clearAuthError, clearUser } = authSlice.actions;
export default authSlice.reducer;
