package service

type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func GetAllUsers() []User {
	return []User{
		{ID: 1, Name: "Nguyen Van A", Email: "a@example.com"},
		{ID: 2, Name: "Tran Thi B", Email: "b@example.com"},
	}
}
