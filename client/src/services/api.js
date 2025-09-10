import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  signin: (credentials) => api.post('/auth/signin', credentials),
  signout: () => api.post('/auth/signout'),
}

// User API
export const userAPI = {
  getUsers: () => api.get('/user'),
  getUserById: (id) => api.get(`/user/${id}`),
  updateUser: (id, userData) => api.patch(`/user/${id}`, userData),
  deleteUser: (id) => api.delete(`/user/${id}`),

  // User Skills
  getUserSkills: () => api.get('/user/skills'),
  addUserSkill: (skillId) => api.post(`/user/skills/${skillId}`),
  deleteUserSkill: (skillId) => api.delete(`/user/skills/${skillId}`),

  // User Courses
  getEnrolledCourses: () => api.get('/user/courses'),
  enrollInCourse: (courseId) => api.post(`/user/courses/${courseId}`),

  // User Lessons
  getUserLessons: () => api.get('/user/lessons'),
  getUserLesson: (lessonId) => api.get(`/user/lessons/${lessonId}`),
  addUserLesson: (lessonId) => api.post(`/user/lessons/${lessonId}`),
  updateUserLesson: (lessonId, data) => api.patch(`/user/lessons/${lessonId}`, data),

  // User Quiz Attempts
  getQuizAttempts: () => api.get('/user/quizAttempts'),
  createQuizAttempt: (quizId, score) => api.post(`/user/quizAttempts/${quizId}`, { score }),
}

// Course API
export const courseAPI = {
  getCourses: () => api.get('/course'),
  getCourse: (id) => api.get(`/course/${id}`),
  createCourse: (courseData) => api.post('/course', courseData),
  updateCourse: (id, courseData) => api.patch(`/course/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/course/${id}`),
  getCourseUsers: (courseId) => api.get(`/course/${courseId}/users`),
}

// Lesson API
export const lessonAPI = {
  getLessons: () => api.get('/lesson'),
  getLesson: (id) => api.get(`/lesson/${id}`),
  createLesson: (lessonData) => api.post('/lesson', lessonData),
  updateLesson: (id, lessonData) => api.patch(`/lesson/${id}`, lessonData),
  deleteLesson: (id) => api.delete(`/lesson/${id}`),
}

// Quiz API
export const quizAPI = {
  getQuizzes: () => api.get('/quiz'),
  getQuiz: (id) => api.get(`/quiz/${id}`),
  createQuiz: (quizData) => api.post('/quiz', quizData),
  updateQuiz: (id, quizData) => api.put(`/quiz/${id}`, quizData),
  deleteQuiz: (id) => api.delete(`/quiz/${id}`),

  // Quiz Questions
  getQuizQuestions: (quizId) => api.get(`/quiz/${quizId}/questions`),
  addQuestionToQuiz: (quizId, questionId) => api.post(`/quiz/${quizId}/questions/${questionId}`),
  removeQuestionFromQuiz: (quizId, questionId) => api.delete(`/quiz/${quizId}/questions/${questionId}`),

  // Quiz Attempts
  getQuizAttempts: (quizId) => api.get(`/quiz/quizAttempts/${quizId}`),
  getQuizAttempt: (quizId, attemptId) => api.get(`/quiz/quizAttempt/${quizId}/${attemptId}`),
}

// Question API
export const questionAPI = {
  getQuestions: () => api.get('/question'),
  getQuestion: (id) => api.get(`/question/${id}`),
  createQuestion: (questionData) => api.post('/question', questionData),
  updateQuestion: (id, questionData) => api.patch(`/question/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/question/${id}`),

  // Question Options
  getQuestionOptions: (questionId) => api.get(`/question/${questionId}/options`),
  createQuestionOption: (questionId, optionData) => api.post(`/question/${questionId}/options`, optionData),
  updateQuestionOption: (optionId, optionData) => api.patch(`/question/options/${optionId}`, optionData),
  deleteQuestionOption: (optionId) => api.delete(`/question/options/${optionId}`),
}

// Skill API
export const skillAPI = {
  getSkills: () => api.get('/skill'),
  getSkill: (id) => api.get(`/skill/${id}`),
  createSkill: (skillData) => api.post('/skill', skillData),
  updateSkill: (id, skillData) => api.patch(`/skill/${id}`, skillData),
  deleteSkill: (id) => api.delete(`/skill/${id}`),
}

export default api