import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown'; // Thêm Dropdown
import { Menubar } from 'primereact/menubar';
import { toast, ToastContainer } from 'react-toastify';
import {jwtDecode} from 'jwt-decode';
import logo from '../res/logo.png'
import '../css/Home.css'; // dùng lại CSS từ Login

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy state từ navigate
  const [exams, setExams] = useState([]); // Danh sách đề
  const [visible, setVisible] = useState(false); // Hiển thị modal
  const [isEdit, setIsEdit] = useState(false); // Xác định đang thêm hay sửa
  const [examName, setExamName] = useState(''); // Tên đề trong modal
  const [editExamId, setEditExamId] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null); // Đề thi được chọn để tạo phòng
  const [roomVisible, setRoomVisible] = useState(false); // Modal tạo phòng

  const [roomCode, setRoomCode] = useState(''); // Mã phòng nhập để tham gia
  const [username, setUsername] = useState(''); // Mã phòng nhập để tham gia


  // Kiểm tra token khi vào trang
  useEffect(() => {
    const token = localStorage.getItem('token');
    setUsername(jwtDecode(token).username);
    if (!token) navigate('/login');
    fetchExams(token); // Lấy danh sách đề khi trang tải
    // Hiển thị toast từ state
    if (location.state?.showToast) {
      const { toastMessage, toastType } = location.state;
      if (toastType === 'info') {
        toast.info(toastMessage, {
          position: 'top-right',
          autoClose: 2000,
        });
      } else if (toastType === 'error') {
        toast.error(toastMessage, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
      // Xóa state sau khi hiển thị để tránh lặp lại
      navigate(location.pathname, { replace: true, state: {} });
    }
    }, [navigate, location.state]);

  // Hàm lấy danh sách đề từ backend
  const fetchExams = async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/exam/get`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setExams(data);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách Quiz:', err);
    }
  };

  // Hàm tạo đề
  const handleSaveExam = async () => {
    const token = localStorage.getItem('token');

    const url = isEdit
      ? `${process.env.REACT_APP_API_URL}/exam/edit/${editExamId}`
      : `${process.env.REACT_APP_API_URL}/exam/create`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ examName }),
      });
      const data = await response.json();
      setVisible(false); // Đóng modal
      setExamName(''); // Reset input
      if (response.ok) {
        fetchExams(token); // Cập nhật danh sách đề
        toast.success("Lưu Quiz thành công!!!", { position: 'top-right', autoClose: 3000 });
      } else {
        toast.error(`Xẩy ra lỗi ${data.message}`, { position: 'top-right', autoClose: 3000 });
      }
    } catch (err) {
      console.error('Lỗi khi lưu Quiz:', err);
      toast.error(`Lỗi khi lưu Quiz: ${err}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  // Hàm xóa đề
  const handleDeleteExam = async (examId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/exam/delete/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        fetchExams(token); // Cập nhật lại danh sách sau khi xóa
        toast.success("Xóa Quiz thành công!!!", { position: 'top-right', autoClose: 3000 });
      } else {
        toast.error(data.message, { position: 'top-right', autoClose: 3000 });
      }
    } catch (err) {
      console.error('Lỗi khi xóa Quiz:', err);
    }
  };

  // Nút chỉnh sửa và xóa trong bảng
  const actionTemplate = (rowData) => {
    return (
      <div className="action-buttons">
    <Button
      label="Sửa tên"
      className="btn-edit"
      onClick={() => openEditExamModal(rowData)}
    />

    <Button
      label="Thêm câu hỏi"
      className="btn-add"
      onClick={() => navigate(`/edit-exam/${rowData.examName}/${rowData._id}`)}
    />

    <Button
      label="Xóa"
      className="btn-delete"
      onClick={() => handleDeleteExam(rowData._id)}
    />
  </div>
    );
  };

  // Hàm tạo phòng
  const handleCreateRoom = async () => {
    if (!selectedExam) {
      toast.warn("Vui lòng chọn một Quiz", { position: 'top-right', autoClose: 3000 });
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/room/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ examId: selectedExam._id }),
      });
      const data = await response.json();
      if (response.ok) {
        setRoomVisible(false);
        navigate(`/room/${data.roomId}`); // Chuyển hướng đến trang phòng
      } else {
        toast.error(`Lỗi: ${data.message}`, { position: 'top-right', autoClose: 3000 });
      }
    } catch (err) {
      toast.error(`Lỗi khi tạo phòng: ${err}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode) {
      toast.warn("Vui lòng nhập mã phòng!", { position: 'top-right', autoClose: 3000 });
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/room/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ roomId: roomCode }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate(`/room/${data.roomId}`);
      } else toast.error(`Lỗi: ${data.message}`, { position: 'top-right', autoClose: 3000 });
    } catch (err) {
      toast.error(`Lỗi khi tạo phòng: ${err}`, { position: 'top-right', autoClose: 3000 });
    }
  };  
  

  const openAddExamModal = () =>{
    setVisible(true);
    setIsEdit(false);
    setExamName('');
  }

  const openEditExamModal = (rowData) =>{
    setVisible(true);
    setIsEdit(true);
    setEditExamId(rowData._id);
    setExamName(rowData.examName);
  }


  const end = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
         {/* Nút đăng xuất */}
        <Button
          label="Đăng Xuất"
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          style={{ marginTop: '0.2rem', marginBottom: '0.2rem'}}
          className="btn"
        />
      </div>
  );



  const start = <img alt="logo" src={logo} height="40" className="mr-2"></img>;


  return (
    <>
      <Menubar start={start} end={end}  style={{backgroundColor: '#fffdf4', position: 'fixed', width: '100%', zIndex: '1000', top: '0', left: '0'}}/>
      <div style={{padding: '20px', marginTop: '3rem'}}>
        <h2 style={{textAlign: 'center'}}>Chào mừng {username} quay trở lại trang chủ!</h2>

        <div className="quiz-container">
          <div className="quiz-card-join-room">
            <div style={{fontWeight: 'bold'}}>Tham gia game? <br/>Xin mời nhập mã phòng</div>
            <div>
              <InputText style={{fontWeight: 'bold', borderRadius:'17px', borderColor: 'black', borderWidth: '3px', textAlign: 'center', height: '3rem'}} value={roomCode} onChange={(e) => setRoomCode(e.target.value)} placeholder="Nhập mã phòng (6 số)"  />
              <Button style={{marginLeft: '0.5rem', color: 'black', backgroundColor: '#ffc679', fontWeight: 'bold', borderRadius:'17px', borderColor: 'black', borderWidth: '3px', textAlign: 'center', height: '3rem'}} label="Tham gia" onClick={handleJoinRoom} />
            </div>
          </div>
        </div>

        <div className="quiz-container">
          <div className="quiz-card">
            <div className="quiz-card-content">
              <div>
                <span style={{ fontSize: '1.4rem' }}>Chưa có phòng chơi ?</span><br />
                Tạo phòng và mời mọi người thôi nào!
              </div>
              <Button
                className="quiz-button"
                label="Tạo phòng"
                icon="pi pi-users"
                onClick={() => setRoomVisible(true)}
              />
            </div>
          </div>

          <div className="quiz-card">
            <div className="quiz-card-content">
              <div>
                <span style={{ fontSize: '1.4rem' }}>Tạo ngay bộ đề độc đáo</span><br />
                khiến cho bạn bè rối não
              </div>
              <Button
                className="quiz-button"
                label="Tạo Quiz"
                icon="pi pi-plus"
                onClick={() => openAddExamModal()}
              />
            </div>
          </div>
        </div>

        <hr style={{ marginTop: '1rem', width: '70%'}} />

        <div className="custom-table-container">
          <DataTable value={exams} tableStyle={{ width: '100%' }}>
            <Column field="examName" header="Tên Quiz" alignHeader="center"/>
            <Column header="Hành động" body={actionTemplate} alignHeader="center"/>
          </DataTable>
        </div>

        {/* Modal tạo đề */}
        <Dialog
          header={isEdit ? 'Sửa Tên Quiz' : 'Tạo Quiz'}
          visible={visible}
          style={{ width: '50vw' }}
          onHide={() => setVisible(false)}
        >
          <div>
            <InputText
              className='dialog-input-text'
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="Nhập tên Quiz"
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <div style={{ textAlign: 'right' }}>
              <Button label={isEdit ? 'Sửa Quiz' :"Tạo Quiz"} onClick={handleSaveExam} />
            </div>
          </div>
        </Dialog>

        {/* Modal tạo phòng */}
        <Dialog header="Tạo Phòng" visible={roomVisible} style={{ width: '50vw' }} onHide={() => setRoomVisible(false)}>
          <div>
            <Dropdown
              className='dialog-input-text'
              value={selectedExam}
              options={exams}
              onChange={(e) => setSelectedExam(e.value)}
              optionLabel="examName"
              placeholder="Chọn quiz"
              style={{ width: '100%', marginBottom: '10px' }}
            />
             <div style={{ textAlign: 'right' }}>
                <Button label="Tạo phòng" onClick={handleCreateRoom} />
              </div>
          </div>
        </Dialog>

      </div>
      <ToastContainer />
    </>
  );
};

export default Home;