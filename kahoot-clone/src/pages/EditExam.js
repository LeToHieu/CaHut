import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import '../css/Home.css'; // dùng lại CSS từ Login

const EditExam = () => {
  const { examName, examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [visible, setVisible] = useState(false); // Hiển thị modal thêm/sửa
  const [isEdit, setIsEdit] = useState(false); // Xác định đang thêm hay sửa
  const [currentQuestion, setCurrentQuestion] = useState({
    _id: null,
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    timeLimit: 15,
  });

  // Lấy danh sách câu hỏi khi trang tải
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    fetchQuestions(token);
  }, [examId, navigate]);

  // Hàm lấy danh sách câu hỏi
  const fetchQuestions = async (token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/question/get/${examId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setQuestions(data);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error('Lỗi khi lấy câu hỏi:', err);
    }
  };

  // Mở modal để thêm câu hỏi
  const openAddQuestionModal = () => {
    setIsEdit(false);
    setCurrentQuestion({
      _id: null,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      timeLimit: 15,
    });
    setVisible(true);
  };

  // Mở modal để sửa câu hỏi
  const openEditQuestionModal = (rowData) => {
    setIsEdit(true);
    setCurrentQuestion({ ...rowData });
    setVisible(true);
  };

  // Xử lý thêm hoặc sửa câu hỏi
  const handleSaveQuestion = async () => {
    const token = localStorage.getItem('token');
    const url = isEdit
      ? `http://localhost:5000/api/question/edit/${currentQuestion._id}`
      : 'http://localhost:5000/api/question/create';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          examId,
          question: currentQuestion.question,
          options: currentQuestion.options,
          correctAnswer: currentQuestion.correctAnswer,
          timeLimit: currentQuestion.timeLimit,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setVisible(false);
        fetchQuestions(token); // Cập nhật lại danh sách
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Lỗi khi lưu câu hỏi:', err);
    }
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = async (questionId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/question/delete/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        fetchQuestions(token); // Cập nhật lại danh sách
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Lỗi khi xóa câu hỏi:', err);
    }
  };

  // Template cho cột hành động
  const actionTemplate = (rowData) => {
    return (
      <div className="action-buttons">
        <Button
          label="Sửa"
          className="btn-edit"
          onClick={() => openEditQuestionModal(rowData)}
        />
        <Button
          label="Xóa"
          className="btn-delete"
          onClick={() => handleDeleteQuestion(rowData._id)}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Thêm câu hỏi vào đề: {examName}</h2>

      {/* Nút thêm câu hỏi */}
      <div  style={{ textAlign: 'right' }}  >
      <Button
        label="Thêm câu hỏi"
        icon="pi pi-plus"
        onClick={openAddQuestionModal}
        style={{ marginBottom: '20px' ,marginLeft: '0.5rem', color: '#fffdf4', backgroundColor: '#33b98a', fontWeight: 'bold', borderRadius:'17px', borderColor: 'black', borderWidth: '3px', textAlign: 'center', height: '3rem'}}
      />
      </div>

      {/* Bảng hiển thị danh sách câu hỏi */}
      <DataTable value={questions} tableStyle={{ minWidth: '50rem', border: '1px black'}} >
        <Column field="question" header="Câu hỏi"   alignHeader="center" />
        <Column field="options" header="Đáp án" body={(rowData) => rowData.options.join(', ')}   alignHeader="center"/>
        <Column field="correctAnswer" header="Đáp án đúng"   alignHeader="center"/>
        <Column field="timeLimit" header="Thời gian (giây)"  alignHeader="center"/>
        <Column header="Hành động" body={actionTemplate}   alignHeader="center"/>
      </DataTable>

      {/* Modal thêm/sửa câu hỏi */}
      <Dialog
        header={isEdit ? 'Sửa Câu Hỏi' : 'Thêm Câu Hỏi'}
        visible={visible}
        style={{ width: '50vw', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px' }}
        onHide={() => setVisible(false)}
      >
        <div style={{ padding: '1rem' }}>
          {/* Nội dung câu hỏi */}
          <InputText
            value={currentQuestion.question}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
            placeholder="Nhập nội dung câu hỏi..."
            style={{ width: '100%', marginBottom: '1.5rem', fontWeight: 'bold'  ,flex: 1, borderRadius:'5px', border: '2px solid black', height: '3.5rem'}}
          />

          {/* Danh sách đáp án */}
          <div style={{ marginBottom: '1.5rem' }}>
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  gap: '0.75rem',
                }}
              >
                {/* Chọn đáp án đúng */}
                <input
                  type="radio"
                  checked={currentQuestion.correctAnswer === option}
                  onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: option })}
                />

                {/* Nhập nội dung đáp án */}
                <InputText
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...currentQuestion.options];
                    newOptions[index] = e.target.value;

                    // Nếu đáp án này đang là đáp án đúng → cập nhật luôn
                    let updatedCorrectAnswer = currentQuestion.correctAnswer;
                    if (currentQuestion.correctAnswer === option) {
                      updatedCorrectAnswer = e.target.value;
                    }

                    setCurrentQuestion({
                      ...currentQuestion,
                      options: newOptions,
                      correctAnswer: updatedCorrectAnswer,
                    });
                  }}
                  placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                  style={{ flex: 1, borderRadius:'10px', border: '1px solid black', height: '3rem'}}
                />
              </div>
            ))}
          </div>

          {/* Thời gian trả lời */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
            <label style={{ fontWeight: 'bold' }}>Thời gian:</label>
            <InputNumber
              value={currentQuestion.timeLimit}
              onValueChange={(e) => setCurrentQuestion({ ...currentQuestion, timeLimit: e.value })}
              placeholder="Giây"
              min={1}
              max={300}
              style={{border: '1px solid black'}}
            />
            <span>giây</span>
          </div>

          {/* Nút Lưu */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button
              label="Lưu Câu Hỏi"
              onClick={handleSaveQuestion}
              style={{
                backgroundColor: '#00b074',
                borderRadius: '20px',
                fontWeight: 'bold',
                color: 'white',
              }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default EditExam;