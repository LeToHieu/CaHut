import React, { useState, useEffect, useRef  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import '../css/Home.css';

const EditExam = () => {
  const { examName, examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    _id: null,
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    timeLimit: 15,
    type: 'normal',
    imageUrl: null,
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    fetchQuestions(token);
  }, [examId, navigate]);

  const fetchQuestions = async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/question/get/${examId}`, {
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

  const openAddQuestionModal = () => {
    setIsEdit(false);
    setCurrentQuestion({
      _id: null,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      timeLimit: 15,
      type: 'normal',
      imageUrl: null,
    });
    setSelectedImage(null);
    setVisible(true);
  };

  const openEditQuestionModal = (rowData) => {
    setIsEdit(true);
    setCurrentQuestion({ ...rowData });
    setSelectedImage(null);
    setVisible(true);
  };

  const handleSaveQuestion = async () => {
    const token = localStorage.getItem('token');
    const url = isEdit
      ? `${process.env.REACT_APP_API_URL}/question/edit/${currentQuestion._id}`
      : `${process.env.REACT_APP_API_URL}/question/create`;
    const method = isEdit ? 'PUT' : 'POST';

    const formData = new FormData();
    formData.append('examId', examId);
    formData.append('question', currentQuestion.question);
    formData.append('options', JSON.stringify(currentQuestion.options));
    formData.append('correctAnswer', currentQuestion.correctAnswer);
    formData.append('timeLimit', currentQuestion.timeLimit);
    formData.append('type', currentQuestion.type);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setVisible(false);
        setSelectedImage(null);
        fetchQuestions(token);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Lỗi khi lưu câu hỏi:', err);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/question/delete/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        fetchQuestions(token);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Lỗi khi xóa câu hỏi:', err);
    }
  };

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

  const imageTemplate = (rowData) => {
    return rowData.imageUrl ? (
      <img
        src={`${process.env.REACT_APP_IMAGE_URL}${rowData.imageUrl}`}
        alt="Question"
        style={{ width: '100px', height: 'auto' }}
      />
    ) : (
      'Không có hình'
    );
  };

  const typeOptions = [
    { label: 'Bình thường', value: 'normal' },
    { label: 'Có hình ảnh', value: 'image' },
  ];

  // Trong component:
const fileInputRef = useRef(null);

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    setSelectedImage(file);
  }
};

  return (
    <div style={{ padding: '20px' }}>
      <h2>Thêm câu hỏi vào đề: {examName}</h2>
      <div style={{ textAlign: 'right' }}>
        <Button
          label="Thêm câu hỏi"
          icon="pi pi-plus"
          onClick={openAddQuestionModal}
          style={{
            marginBottom: '20px',
            marginLeft: '0.5rem',
            color: '#fffdf4',
            backgroundColor: '#33b98a',
            fontWeight: 'bold',
            borderRadius: '17px',
            borderColor: 'black',
            borderWidth: '3px',
            textAlign: 'center',
            height: '3rem',
          }}
        />
      </div>
      <DataTable value={questions} tableStyle={{ minWidth: '50rem', border: '1px black' }}>
        <Column field="question" header="Câu hỏi" alignHeader="center" />
        <Column field="options" header="Đáp án" body={(rowData) => rowData.options.join(', ')} alignHeader="center" />
        <Column field="correctAnswer" header="Đáp án đúng" alignHeader="center" />
        <Column field="timeLimit" header="Thời gian (giây)" alignHeader="center" />
        <Column field="type" header="Loại câu hỏi" body={(rowData) => (rowData.type === 'normal' ? 'Bình thường' : 'Có hình ảnh')} alignHeader="center" />
        <Column header="Hình ảnh" body={imageTemplate} alignHeader="center" />
        <Column header="Hành động" body={actionTemplate} alignHeader="center" />
      </DataTable>
      <Dialog
        header={isEdit ? 'Sửa Câu Hỏi' : 'Thêm Câu Hỏi'}
        visible={visible}
        style={{ width: '50vw', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px' }}
        onHide={() => setVisible(false)}
      >
        <div style={{ padding: '1rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 'bold', marginRight: '1rem' }}>Loại câu hỏi:</label>
            <Dropdown
              value={currentQuestion.type}
              options={typeOptions}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.value })}
              placeholder="Chọn loại câu hỏi"
              style={{ width: '200px' }}
            />
          </div>
          <InputText
            value={currentQuestion.question}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
            placeholder="Nhập nội dung câu hỏi..."
            style={{
              width: '100%',
              marginBottom: '1.5rem',
              fontWeight: 'bold',
              flex: 1,
              borderRadius: '5px',
              border: '2px solid black',
              height: '3.5rem',
            }}
          />
          {currentQuestion.type === 'image' && (
            <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
              Chọn hình ảnh:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* input ẩn */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
          
              {/* Nút trigger input */}
              <Button
                label={selectedImage ? "Đã chọn ảnh" : "Tải ảnh lên"}
                icon="pi pi-upload"
                className="p-button-outlined"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px solid black',
                  backgroundColor: '#ffffff',
                  fontWeight: 'bold',
                  color: '#333',
                  borderRadius: '12px',
                }}
              />
          
              {/* Ảnh preview */}
              {(selectedImage || currentQuestion.imageUrl) && (
                <img
                  src={
                    selectedImage
                      ? URL.createObjectURL(selectedImage)
                      : `${process.env.REACT_APP_IMAGE_URL}${currentQuestion.imageUrl}`
                  }
                  alt="Preview"
                  style={{
                    width: '150px',
                    height: 'auto',
                    borderRadius: '10px',
                    border: '1px solid #ccc',
                  }}
                />
              )}
            </div>
          </div>
          )}
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
                <input
                  type="radio"
                  checked={currentQuestion.correctAnswer === option}
                  onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: option })}
                />
                <InputText
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...currentQuestion.options];
                    newOptions[index] = e.target.value;
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
                  style={{ flex: 1, borderRadius: '10px', border: '1px solid black', height: '3rem' }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
            <label style={{ fontWeight: 'bold' }}>Thời gian:</label>
            <InputNumber
              value={currentQuestion.timeLimit}
              onValueChange={(e) => setCurrentQuestion({ ...currentQuestion, timeLimit: e.value })}
              placeholder="Giây"
              min={1}
              max={300}
              style={{ border: '1px solid black' }}
            />
            <span>giây</span>
          </div>
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