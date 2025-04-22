import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';

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
    timeLimit: 30,
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
      timeLimit: 30,
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
      <div>
        <Button
          label="Sửa"
          className="p-button-text"
          onClick={() => openEditQuestionModal(rowData)}
        />
        <Button
          label="Xóa"
          className="p-button-danger p-button-text"
          onClick={() => handleDeleteQuestion(rowData._id)}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Thêm câu hỏi vào đề: {examName}</h2>

      {/* Nút thêm câu hỏi */}
      <Button
        label="Thêm câu hỏi"
        icon="pi pi-plus"
        onClick={openAddQuestionModal}
        style={{ marginBottom: '20px' }}
      />

      {/* Bảng hiển thị danh sách câu hỏi */}
      <DataTable value={questions} tableStyle={{ minWidth: '50rem' }}>
        <Column field="question" header="Câu hỏi" />
        <Column field="options" header="Đáp án" body={(rowData) => rowData.options.join(', ')} />
        <Column field="correctAnswer" header="Đáp án đúng" />
        <Column field="timeLimit" header="Thời gian (giây)" />
        <Column header="Hành động" body={actionTemplate} />
      </DataTable>

      {/* Modal thêm/sửa câu hỏi */}
      <Dialog
        header={isEdit ? 'Sửa Câu Hỏi' : 'Thêm Câu Hỏi'}
        visible={visible}
        style={{ width: '50vw' }}
        onHide={() => setVisible(false)}
      >
        <div>
          <InputText
            value={currentQuestion.question}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
            placeholder="Nội dung câu hỏi"
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {currentQuestion.options.map((option, index) => (
            <InputText
              key={index}
              value={option}
              onChange={(e) => {
                const newOptions = [...currentQuestion.options];
                newOptions[index] = e.target.value;
                setCurrentQuestion({ ...currentQuestion, options: newOptions });
              }}
              placeholder={`Đáp án ${index + 1}`}
              style={{ width: '100%', marginBottom: '10px' }}
            />
          ))}
          <InputText
            value={currentQuestion.correctAnswer}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
            placeholder="Đáp án đúng"
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <InputNumber
            value={currentQuestion.timeLimit}
            onValueChange={(e) => setCurrentQuestion({ ...currentQuestion, timeLimit: e.value })}
            placeholder="Thời gian (giây)"
            min={1}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <Button label="Lưu" onClick={handleSaveQuestion} />
        </div>
      </Dialog>
    </div>
  );
};

export default EditExam;