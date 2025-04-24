import request, { gql } from "graphql-request"
const { encrypt, decrypt, encryptObject, decryptObject, encryptArray, decryptArray } = require('../utils/encryption');

const MASTER_URL = "https://ap-south-1.cdn.hygraph.com/content/cm9upm3c400m806uws4ee9kcn/master"

const getAllCourseList = async () => {
  const query = gql`
    query GetAllCourses {
      courses {
        id
        nameofcourse
        description
        price
        isfree
        nicknameforcourse
        updatedAt
        dataofcourse
        isDraft
        classOfCourse
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

const getcourseinfo = async (courseid) => {
  try {
    const query2 = gql`
      query GetCourse {
        course(where: {nicknameforcourse: "${courseid}"}) {
          nameofcourse
          price
          description
          
          isfree
          nicknameforcourse
           
          
        }
      }
    `;

    const result = await request(MASTER_URL, query2);

    if (!result.course) {
      console.log('Course not found:', courseid);
      return { course: null };
    }

    return result;
  } catch (error) {
    console.error('Error fetching course:', error);
    return { course: null }; // Return null course instead of throwing
  }
};


const getQuizResults = async () => {
  const query = gql`
    query GetQuizResults {
      quizresult(where: { id: "cm9e95c4x1c7j07o3v11kjod3" }) {
        jsonReslut
      }
    }
  `;

  try {
    const result = await request(MASTER_URL, query);
    return JSON.parse(result.quizresult?.jsonReslut || '{"results": []}');
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return { results: [] };
  }
};

const SaveGradesOfQuiz = async (userEmail, userName, userGrade, quizname, numofqus, jsonResult = null) => {
  try {
    // Get existing results first
    const existingData = await getQuizResults();
    const currentResults = existingData?.results || [];

    // Prepare new result
    const newResult = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userEmail,
      userName,
      quizGrade: userGrade,
      nameofquiz: quizname,
      numofqus: numofqus,
      submittedAt: new Date().toISOString(),
      ...(jsonResult || {})
    };

    // Update results array
    const updatedData = {
      results: [...currentResults, newResult]
    };

    // Save updated results
    const response = await updateQuizResults(userEmail, userName, updatedData);

    if (!response?.updateQuizresult?.id) {
      throw new Error('Failed to update quiz results');
    }

    return response;
  } catch (error) {
    console.error('Error in SaveGradesOfQuiz:', error);
    throw new Error('Failed to save quiz results');
  }
};

const getQuizJsonResult = async (email) => {
  try {
    const allResults = await getQuizResults();
    const userResults = allResults.results.filter(result => result.userEmail === email);
    return { quizresults: userResults };
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return { quizresults: [] };
  }
};


const publishEnrolls = async () => {
  const wie = gql`
   mutation MyMutation {
  publishManyUserEnrollsConnection {
    edges {
      node {
        id
      }
    }
  }
}
    `

  const back = await request(MASTER_URL, wie)
  return back
}

const getNotifications = async () => {
  const query = gql`
    query GetNotifications {
      notifictions {
        id
        message
        updatedAt
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return { notifications: result.notifictions || [] };
};

const createNotification = async (notification) => {
  const mutation = gql`
    mutation CreateNotification {
      createNotifiction(
        data: {
          message: "${notification.message}"
        }
      ) {
        id
      }
      publishNotifiction(where: {id: ""}) {
        id
      }
      publishManyNotifictionsConnection {
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  return await request(MASTER_URL, mutation);
};

const updateNotification = async (id, notification) => {
  const mutation = gql`
    mutation UpdateNotification {
      updateNotifiction(
        where: { id: "${id}" }
        data: {
          message: "${notification.message}"
        }
      ) {
        id
      }
      publishNotifiction(where: { id: "${id}" }) {
        id
      }
    }
  `;

  return await request(MASTER_URL, mutation);
};

const deleteNotification = async (id) => {
  const mutation = gql`
    mutation DeleteNotification {
      deleteNotifiction(where: { id: "${id}" }) {
        id
      }
    }
  `;

  return await request(MASTER_URL, mutation);
};

const sendExamData = async (formattedData, examTitle) => {
  const escapedData = formattedData.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const query = gql`
    mutation MyMutation {
      createExam(
        data: {jsonexam: "${escapedData}", title: "${examTitle}"}
      ) {
        id
      }
    }
    publishManyExamsConnection(first: 1000) {
      edges {
        node {
          id
        }
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

const getPaymentLogs = async () => {
  const query = gql`
    query GetPaymentLogs {
      userEnrolls(
        orderBy: createdAt_DESC
        where: {isHePaid: false}
      ) {
        id
        userEmail
        phonenumber
        createdAt
        course {
          nameofcourse
          price
        }
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

const sendquiz = async (title, jsonData) => {
  try {
    // Ensure the JSON is properly escaped for GraphQL
    const escapedJson = jsonData.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    const query = gql`
      mutation CreateQuiz {
        createExam(data: {
          title: "${title}",
          jsonexam: "${escapedJson}"
        }) {
          id
        }
        publishManyExamsConnection(first: 1000) {
    edges {
      node {
        id
      }
    }
  }
      }
    `;

    const result = await request(MASTER_URL, query);
    return result;
  } catch (error) {
    console.error('GraphQL Error:', error);
    throw new Error(error.message || 'Failed to create quiz');
  }
};

const getAllExams = async () => {
  const query = gql`
    query GetAllExams {
      exams {
        id
        title
        jsonexam
      }
    }
  `;
  const result = await request(MASTER_URL, query);
  return result;
};

const updateExam = async (examId, title, jsonData) => {
  const escapedJson = jsonData.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const query = gql`
    mutation UpdateExam {
      updateExam(
        where: { id: "${examId}" }
        data: { title: "${title}", jsonexam: "${escapedJson}" }
      ) {
        id
      }
      publishExam(where: { id: "${examId}" }) {
        id
      }
    }
  `;
  const result = await request(MASTER_URL, query);
  return result;
};

const getActivationData = async () => {
  const query = gql`
    query GetPaymentLogs {
      actvition(where: {id: "cm9ebuavq1dxx07pmynhukjm7"}) {
        activit
        id
      }
    }
  `;

  try {
    const result = await request(MASTER_URL, query);

    if (!result?.actvition?.activit) {
      return { actvition: { activit: [] } };
    }

    // Handle already parsed data
    if (Array.isArray(result.actvition.activit)) {
      return result;
    }

    try {
      // First try parsing as JSON
      let parsedData = JSON.parse(result.actvition.activit);
      return {
        ...result,
        actvition: {
          ...result.actvition,
          activit: Array.isArray(parsedData) ? parsedData : []
        }
      };
    } catch (parseError) {
      // If parsing fails, try decrypting
      try {
        const decryptedData = decrypt(result.actvition.activit);
        const parsedData = JSON.parse(decryptedData);
        return {
          ...result,
          actvition: {
            ...result.actvition,
            activit: Array.isArray(parsedData) ? parsedData : []
          }
        };
      } catch (decryptError) {
        console.error('Failed to parse/decrypt activation data:', decryptError);
        return { actvition: { activit: [] } };
      }
    }
  } catch (error) {
    console.error('API Error:', error);
    return { actvition: { activit: [] } };
  }
};

const updateActivationData = async (newData) => {
  // Encrypt the entire array
  const encryptedData = encrypt(JSON.stringify(newData));

  const mutation = gql`
    mutation UpdateActivation {
      updateActvition(
        where: { id: "cm9ebuavq1dxx07pmynhukjm7" }
        data: { activit: "${encryptedData}" }
      ) {
        id
      }
      publishActvition(where: { id: "cm9ebuavq1dxx07pmynhukjm7" }) {
        id
      }
    }
  `;
  return await request(MASTER_URL, mutation);
};

const saveNewActivation = async (userData) => {
  try {
    const existingData = await getActivationData();
    let activations = existingData?.actvition?.activit || [];

    const newActivation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...userData
    };

    activations.push(newActivation);
    await updateActivationData(activations);
    return newActivation;
  } catch (error) {
    console.error('Error saving activation:', error);
    throw error;
  }
};

const updateActivationStatus = async (activationId, newStatus) => {
  try {
    const existingData = await getActivationData();

    // Ensure activations is an array
    const activations = Array.isArray(existingData.actvition?.activit)
      ? existingData.actvition.activit
      : [];

    // Clean the data before updating
    const updatedActivations = activations.map(activation => {
      if (activation.id === activationId) {
        return {
          ...activation,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          // Ensure all required fields exist
          timestamp: activation.timestamp || new Date().toISOString(),
          courseId: activation.courseId || '',
          courseName: activation.courseName || '',
          userEmail: activation.userEmail || '',
          phoneNumber: activation.phoneNumber || '',
          price: Number(activation.price) || 0
        };
      }
      return activation;
    });

    // Stringify the array properly
    const stringData = JSON.stringify(updatedActivations);
    // Encrypt the stringified data
    const encryptedData = encrypt(stringData);

    const mutation = gql`
      mutation UpdateActivation {
        updateActvition(
          where: { id: "cm9ebuavq1dxx07pmynhukjm7" }
          data: { activit: "${encryptedData}" }
        ) {
          id
        }
        publishActvition(where: { id: "cm9ebuavq1dxx07pmynhukjm7" }) {
          id
        }
      }
    `;

    await request(MASTER_URL, mutation);
    return true;
  } catch (error) {
    console.error('Error updating activation status:', error);
    throw error;
  }
};

const checkUserEnrollment = async (userEmail, courseId) => {
  try {
    const activationData = await getActivationData();
    if (!activationData?.actvition?.activit) {
      console.log('No activation data found');
      return false;
    }

    let activations = [];
    try {
      // Handle encrypted data
      if (typeof activationData.actvition.activit === 'string') {
        const decryptedData = decrypt(activationData.actvition.activit);
        activations = JSON.parse(decryptedData);
      } else {
        // If data is already parsed
        activations = activationData.actvition.activit;
      }

      // Check enrollment status
      const hasApprovedActivation = activations.some(
        activation =>
          activation.userEmail === userEmail &&
          activation.courseId === courseId &&
          activation.status === 'approved'
      );

      console.log('Enrollment check:', { userEmail, courseId, hasAccess: hasApprovedActivation });
      return hasApprovedActivation;
    } catch (decryptError) {
      console.error('Error decrypting/parsing activation data:', decryptError);
      return false;
    }
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
};

const addManualActivation = async (activationData) => {
  try {
    // Get existing activations
    const existingData = await getActivationData();
    let activations = [];

    try {
      activations = JSON.parse(existingData.actvition?.activit || '[]');
    } catch (e) {
      activations = [];
    }

    // Create new activation object
    const newActivation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...activationData,
      status: 'approved'  // Manual activations are approved by default
    };

    // Add to activations array
    activations.push(newActivation);

    // Update the database
    await updateActivationData(activations);
    return newActivation;
  } catch (error) {
    console.error('Error adding manual activation:', error);
    throw error;
  }
};

const addQuiz = async (courseData) => {
  const {
    videoLink = "",
    chapterName = "",
    examTitle = "",
    examJson = "",
    courseName = "",
    courseNickname = "",
    price = 10,
    isFree = false,
    courseDate = new Date().toISOString()
  } = courseData;

  const query = gql`
    mutation CreateCourse {
      createCourse(
        data: { 
           
          isfree: ${isFree},
          nameofcourse: "${courseName}",
          nicknameforcourse: "${courseNickname}",
          price: ${price},
          updatedAt: "${courseDate}",
          dataofcourse: "${courseDate}"
        }
      ) {
        id
        nameofcourse
      }
      publishManyCoursesConnection {
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

const createCourse = async (courseData) => {
  // Escape strings to prevent GraphQL syntax errors
  const escapedTitle = courseData.nameofcourse.replace(/"/g, '\\"');
  const escapedDesc = courseData.description.replace(/"/g, '\\"');
  const escapedNickname = courseData.nicknameforcourse.replace(/"/g, '\\"');

  // Create chapters array for mutation
  const chaptersData = courseData.chapters.map(ch => ({
    nameofchapter: ch.nameofchapter.replace(/"/g, '\\"'),
    linkOfVideo: ch.linkOfVideo.replace(/"/g, '\\"')
  }));

  // Build the mutation string
  const mutation = gql`
    mutation CreateCourse {
      createCourse(
        data: {
          nameofcourse: "${escapedTitle}"
          description: "${escapedDesc}"
          price: ${courseData.price}
          isfree: ${courseData.isfree}
          dataofcourse: "${courseData.dataofcourse}"
          nicknameforcourse: "${escapedNickname}"
          isDraft: ${courseData.isDraft || false}
        
        }
      ) {
        id
        nameofcourse
      }
    }
  `;

  try {
    const result = await request(MASTER_URL, mutation);

    // After creating the course, publish it
    if (result?.createCourse?.id) {
      await request(MASTER_URL, gql`
        mutation PublishCourse {
          publishCourse(where: { id: "${result.createCourse.id}" }) {
            id
          }
        }
      `);
      await addChaptersForCourse(courseData.nicknameforcourse, courseData.chapters);
    }

    return result;
  } catch (error) {
    console.error('CreateCourse Error:', error);
    throw error;
  }
};

const updateCourse = async (courseId, courseData) => {
  try {
    if (!courseId) throw new Error('Course ID is required');

    // Escape special characters in strings
    const escapedTitle = courseData.nameofcourse?.replace(/"/g, '\\"') || '';
    const escapedDesc = courseData.description?.replace(/"/g, '\\"') || '';
    const escapedNickname = courseData.nicknameforcourse?.replace(/"/g, '\\"') || '';

    const mutation = gql`
            mutation UpdateCourse {
                updateCourse(
                    where: { id: "${courseId}" }
                    data: {
                        nameofcourse: "${escapedTitle}"
                        description: "${escapedDesc}"
                        price: ${Number(courseData.price) || 0}
                        isfree: ${Boolean(courseData.isfree)}
                        isDraft: ${Boolean(courseData.isDraft)}
                        nicknameforcourse: "${escapedNickname}"
                        dataofcourse: "${courseData.dataofcourse || new Date().toISOString().split('T')[0]}"
                    }
                ) {
                    id
                    nameofcourse
                    description
                    price
                    isfree
                    isDraft
                    nicknameforcourse
                    dataofcourse
                }
            }
        `;

    const result = await request(MASTER_URL, mutation);

    // Publish the updated course
    if (result?.updateCourse?.id) {
      await request(MASTER_URL, gql`
                mutation PublishCourse {
                    publishCourse(where: { id: "${courseId}" }) {
                        id
                    }
                }
            `);
    }

    return result;
  } catch (error) {
    console.error('Update course error:', error);
    throw error;
  }
};

// Initialize chapter data if not exists
const initializeChapterData = async () => {
  const mutation = gql`
    mutation InitializeChapter {
      createChapter(
        data: {
          chapterData: "{\"chapters\":[]}"
        }
      ) {
        id
      }
      publishChapter(where: { id: "cm9ffash61wgf07pmxchg9bl2" }) {
        id
      }
    }
  `;

  try {
    await request(MASTER_URL, mutation);
  } catch (error) {
    console.error('Chapter data already exists');
  }
};

const getChaptersData = async () => {
  const query = gql`
    query GetChapters {
      chpater(where: {id: "cm9ffash61wgf07pmxchg9bl2"}) {
        chapterData
      }
    }
  `;

  try {
    const result = await request(MASTER_URL, query);
    console.log('Raw chapter data:', result); // Debug log

    if (!result?.chpater?.chapterData) {
      console.log('No chapter data found, returning empty array');
      return { chapters: [] };
    }

    let parsedData;
    try {
      parsedData = JSON.parse(result.chpater.chapterData);
      if (parsedData.chapters) {
        parsedData.chapters = parsedData.chapters.map(chapter => ({
          id: chapter.id || `chapter-${Date.now()}-${Math.random()}`,
          title: chapter.title || '',
          courseNickname: chapter.courseNickname || '',
          order: chapter.order || 0,
          lessons: Array.isArray(chapter.lessons) ? chapter.lessons.map(lesson => ({
            id: lesson.id || `lesson-${Date.now()}-${Math.random()}`,
            title: lesson.title || '',
            link: lesson.link || '',
            order: lesson.order || 0
          })) : []
        }));
      }
    } catch (e) {
      console.error('Error parsing chapter data:', e);
      return { chapters: [] };
    }

    return parsedData || { chapters: [] };
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return { chapters: [] };
  }
};

const updateChaptersData = async (newData) => {
  if (!newData || !Array.isArray(newData.chapters)) {
    console.error('Invalid chapter data format');
    return;
  }

  // Ensure proper structure for each chapter
  const sanitizedData = {
    chapters: newData.chapters.map(chapter => ({
      id: chapter.id || `chapter-${Date.now()}-${Math.random()}`,
      title: chapter.nameofchapter || chapter.title || '', // Handle both nameofchapter and title
      courseNickname: chapter.courseNickname || '',
      order: chapter.order || 0,
      lessons: (chapter.lessons || []).map(lesson => ({
        id: lesson.id || `lesson-${Date.now()}-${Math.random()}`,
        title: lesson.title || lesson.name || '', // Handle both title and name
        link: lesson.link || '',
        order: lesson.order || 0
      }))
    }))
  };

  const mutation = gql`
    mutation UpdateChapters {
      updateChpater(
        where: { id: "cm9ffash61wgf07pmxchg9bl2" }
        data: { chapterData: ${JSON.stringify(JSON.stringify(sanitizedData))} }
      ) {
        id
      }
      publishChpater(where: { id: "cm9ffash61wgf07pmxchg9bl2" }) {
        id
      }
    }
  `;

  return await request(MASTER_URL, mutation);
};

const addChaptersForCourse = async (courseNickname, chapters) => {
  try {
    if (!Array.isArray(chapters)) {
      console.error('Chapters must be an array');
      return [];
    }

    const existingData = await getChaptersData();
    const currentChapters = existingData?.chapters || [];

    // Remove any existing chapters for this course
    const filteredChapters = currentChapters.filter(
      ch => ch.courseNickname !== courseNickname
    );

    // Add new chapters with order
    const newChapters = chapters.map((chapter, index) => ({
      title: chapter.nameofchapter || '',
      linkOfVideo: chapter.linkOfVideo || '',
      order: index + 1,
      courseNickname
    }));

    // Update the chapters array
    const updatedData = {
      chapters: [...filteredChapters, ...newChapters]
    };

    await updateChaptersData(updatedData);
    return newChapters;
  } catch (error) {
    console.error('Error adding chapters:', error);
    return [];
  }
};

const updateCourseChapters = async (courseNickname, chapters) => {
  try {
    const existingData = await getChaptersData();
    const otherChapters = existingData.chapters.filter(
      ch => ch.courseNickname !== courseNickname
    );

    // Process updated chapters with proper structure
    const updatedChapters = chapters.map((chapter, chapterIndex) => ({
      id: chapter.id || `chapter-${Date.now()}-${chapterIndex}`,
      title: chapter.nameofchapter || '', // Ensure chapter title is saved
      courseNickname,
      order: chapterIndex + 1,
      lessons: (chapter.lessons || [{ // Provide default lesson if none exist
        id: `lesson-${Date.now()}-0`,
        title: '',
        link: '',
        order: 1
      }]).map((lesson, lessonIndex) => ({
        id: lesson.id || `lesson-${Date.now()}-${lessonIndex}`,
        title: lesson.name || lesson.title || '',
        link: lesson.link || '',
        order: lessonIndex + 1
      }))
    }));

    const updatedData = {
      chapters: [...otherChapters, ...updatedChapters]
    };

    await updateChaptersData(updatedData);
    return updatedChapters;
  } catch (error) {
    console.error('Error updating chapters:', error);
    throw error;
  }
};

const getExamOrder = async () => {
  const query = gql`
        query GetExamOrder {
            examOrder(where: {id: "cm9fhma8u1xs207pme97r16aw"}) {
                examJsonOrder
            }
        }
    `;

  try {
    const result = await request(MASTER_URL, query);
    if (!result?.examOrder?.examJsonOrder) {
      return { examOrders: [] };
    }

    // Parse the JSON string and ensure it has the right structure
    let examData;
    try {
      examData = typeof result.examOrder.examJsonOrder === 'string'
        ? JSON.parse(result.examOrder.examJsonOrder)
        : result.examOrder.examJsonOrder;

      // Ensure examOrders is an array with the required fields
      const examOrders = examData.examOrders?.map(order => ({
        examId: order.examId || '',
        courseNickname: order.courseNickname || '',
        order: order.order || 0,
        title: order.title || ''
      })) || [];

      return { examOrders };
    } catch (e) {
      console.error('Error parsing exam orders:', e);
      return { examOrders: [] };
    }
  } catch (error) {
    console.error('Error fetching exam orders:', error);
    return { examOrders: [] };
  }
};

const updateExamOrder = async (newData) => {
  const mutation = gql`
    mutation UpdateExamOrder {
      updateExamOrder(
        where: { id: "cm9fhma8u1xs207pme97r16aw" }
        data: { examJsonOrder: ${JSON.stringify(JSON.stringify(newData))} }
      ) {
        id
      }
      publishExamOrder(where: { id: "cm9fhma8u1xs207pme97r16aw" }) {
        id
      }
    }
  `;

  return await request(MASTER_URL, mutation);
};

const updateCourseExams = async (courseNickname, exams) => {
  try {
    const existingData = await getExamOrder();

    // Filter out exams of the current course
    const otherExams = existingData.examOrders?.filter(
      ex => ex.courseNickname !== courseNickname
    ) || [];

    // Add updated exams
    const updatedExams = exams.map((exam, index) => ({
      examId: exam.id,
      title: exam.title,
      order: index + 1,
      courseNickname
    }));

    const updatedData = {
      examOrders: [...otherExams, ...updatedExams]
    };

    await updateExamOrder(updatedData);
    return updatedExams;
  } catch (error) {
    console.error('Error updating exam order:', error);
    throw error;
  }
};


const getOffer = async () => {
  const query = gql`
   query GetAllCourses {
  offer(where: {id: "cm9flmj6y20c107pmtuftf60w"}) {
    docname
    first
    fourth
    fetures
    name
    priceafter
    pricebefore
    second
    stage
    third
  }
}
  `;
  const result = await request(MASTER_URL, query);
  return result;
};

const updateOffer = async (offerData) => {
  try {
    // Handle multiline strings and escape characters
    const sanitizedData = {
      ...offerData,
      fetures: offerData.fetures?.replace(/\n/g, '\\n').replace(/"/g, '\\"') || '',
      first: offerData.first?.replace(/"/g, '\\"') || '',
      second: offerData.second?.replace(/"/g, '\\"') || '',
      third: offerData.third?.replace(/"/g, '\\"') || '',
      fourth: offerData.fourth?.replace(/"/g, '\\"') || '',
      docname: offerData.docname?.replace(/"/g, '\\"') || '',
      name: offerData.name?.replace(/"/g, '\\"') || '',
    };

    const mutation = gql`
      mutation UpdateOffer {
        updateOffer(
          where: { id: "cm9flmj6y20c107pmtuftf60w" }
          data: { 
            docname: "${sanitizedData.docname}",
            first: "${sanitizedData.first}",
            fourth: "${sanitizedData.fourth}",
            fetures: "${sanitizedData.fetures}",
            name: "${sanitizedData.name}",
            priceafter: ${sanitizedData.priceafter || 0},
            pricebefore: ${sanitizedData.pricebefore || 0},
            second: "${sanitizedData.second}",
            third: "${sanitizedData.third}"
          }
        ) {
          id
          stage
        }
        publishOffer(where: { id: "cm9flmj6y20c107pmtuftf60w" }) {
          id
        }
      }
    `;

    const result = await request(MASTER_URL, mutation);
    return result;
  } catch (error) {
    console.error('GraphQL Error:', error);
    throw error;
  }
};

const getQuizById = async (quizId) => {
  const query = `
  query MyQuery {
      exam(where: {id: "${quizId}"}) {
          id
          jsonexam
      }
  }`;

  const result = await request(MASTER_URL, query);
  return result;
};

const deleteActivation = async (activationId) => {
  try {
    const existingData = await getActivationData();
    let activations = JSON.parse(existingData.actvition?.activit || '[]');

    // Filter out the activation to delete
    const updatedActivations = activations.filter(
      activation => activation.id !== activationId
    );

    // Update the data
    await updateActivationData(updatedActivations);
    return true;
  } catch (error) {
    console.error('Error deleting activation:', error);
    throw error;
  }
};

const updateAllCourses = async (data) => {
  // For each course in the data
  try {
    for (const course of data.courses) {
      // Update course data
      await updateCourse(course.id, course);
    }

    // If there are chapters, update them
    if (data.chapters) {
      for (const [courseNickname, chapters] of Object.entries(data.chapters)) {
        await updateCourseChapters(courseNickname, chapters);
      }
    }

    // If there are exams, update them
    if (data.exams) {
      await updateExamOrder(data.exams);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating courses:', error);
    throw error;
  }
};

const createBookOrder = async (orderData) => {
  const mutation = gql`
    mutation CreateBookOrder {
      createBookOrder(data: {
        name: "${orderData.name}",
        phone: "${orderData.phone}",
        governorate: "${orderData.governorate}",
        address: "${orderData.address}",
        bookId: "${orderData.bookId}",
        status: "pending"
      }) {
        id
      }
      publishBookOrder {
        id
      }
    }
  `;

  return await request(MASTER_URL, mutation);
};

const getBookOrders = async () => {
  const query = gql`
    query MyQuery {
      bookOrder(where: {id: "cm9mzx1m00zbd07obpqiv93u3"}) {
        id
        books
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

const saveBookOrder = async (orderData) => {
  try {
    const existingData = await getBookOrders();
    let orders = [];
    try {
      orders = JSON.parse(existingData.bookOrder.books || '[]');
    } catch (e) {
      orders = [];
    }

    const newOrder = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...orderData
    };

    // Check if user has a pending order for the same book
    const hasPendingOrder = orders.some(order =>
      order.userEmail === orderData.userEmail &&
      order.bookId === orderData.bookId &&
      order.status === 'pending'
    );

    if (hasPendingOrder) {
      throw new Error('لديك طلب معلق لنفس الكتاب');
    }

    orders.push(newOrder);

    const mutation = gql`
      mutation UpdateBookOrder {
        updateBookOrder(
          where: { id: "cm9mzx1m00zbd07obpqiv93u3" }
          data: { books: ${JSON.stringify(JSON.stringify(orders))} }
        ) {
          id
        }
        publishBookOrder(where: { id: "cm9mzx1m00zbd07obpqiv93u3" }) {
          id
        }
      }
    `;

    return await request(MASTER_URL, mutation);
  } catch (error) {
    console.error('Error saving book order:', error);
    throw error;
  }
};

const updateBookOrders = async (orders) => {
  const mutation = gql`
    mutation UpdateBookOrder {
      updateBookOrder(
        where: { id: "cm9mzx1m00zbd07obpqiv93u3" }
        data: { books: ${JSON.stringify(JSON.stringify(orders))} }
      ) {
        id
      }
      publishBookOrder(where: { id: "cm9mzx1m00zbd07obpqiv93u3" }) {
        id
      }
    }
  `;

  return await request(MASTER_URL, mutation);
};

const getBooks = async () => {
  const query = gql`
    query GetBooks {
      bookOrder(where: {id: "cm9n1q4oi10dx07obh81ejrsv"}) {
        id
        books
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

const saveBooks = async (booksData) => {
  const mutation = gql`
    mutation UpdateBooks {
      updateBookOrder(
        where: { id: "cm9n1q4oi10dx07obh81ejrsv" }
        data: { books: ${JSON.stringify(JSON.stringify(booksData))} }
      ) {
        id
      }
      publishBookOrder(where: { id: "cm9n1q4oi10dx07obh81ejrsv" }) {
        id
      }
    }
  `;

  return await request(MASTER_URL, mutation);
};

const getClassCourses = async () => {
  const query = gql`
    query GetClassCourses {
      classCourse(where: {id: "cm9odr9sq21nc08o9qu036ubl"}) {
        id
        classCourse
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

const updateClassCourses = async (classData) => {
  const mutation = gql`
    mutation UpdateClassCourses {
      updateClassCourse(
        where: { id: "cm9odr9sq21nc08o9qu036ubl" }
        data: { classCourse: ${JSON.stringify(JSON.stringify(classData))} }
      ) {
        id
      }
      publishClassCourse(where: { id: "cm9odr9sq21nc08o9qu036ubl" }) {
        id
      }
    }
  `;

  return await request(MASTER_URL, mutation);
};

const createClassCourse = async (className) => {
  try {
    // Get existing class course data first
    const result = await getClassCourses();
    let classes;

    try {
      // Parse existing data
      classes = JSON.parse(result.classCourse.classCourse || '[]');
    } catch (e) {
      classes = [];
    }

    // Create new class object
    const newClass = {
      id: `class-${Date.now()}`,
      name: className,
      createdAt: new Date().toISOString()
    };

    // Add to classes array
    classes.push(newClass);

    // Update class courses
    const mutation = gql`
      mutation UpdateClassCourse {
        updateClassCourse(
          where: { id: "cm9odr9sq21nc08o9qu036ubl" }
          data: { classCourse: ${JSON.stringify(JSON.stringify(classes))} }
        ) {
          id
        }
        publishClassCourse(where: { id: "cm9odr9sq21nc08o9qu036ubl" }) {
          id
        }
      }
    `;

    const updateResult = await request(MASTER_URL, mutation);
    return updateResult;
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
};

const updateCourseClass = async (courseId, classId) => {
  const mutation = gql`
    mutation UpdateCourseClass {
      updateCourse(
        where: { id: "${courseId}" }
        data: { classOfCourse: "${classId}" }
      ) {
        id
      }
      publishCourse(where: { id: "${courseId}" }) {
        id
      }
    }
  `;

  return await request(MASTER_URL, mutation);
};


const getStudentHistory = async () => {
  const query = gql`
    query GetStudentHistory {
      historyOfStudent(where: {id: "cm9pokhh22uni07ob8f96d1b9"}) {
        id
        historyy
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

const saveStudentHistory = async (historyData) => {
  try {
    // Get existing history data
    const existingData = await getStudentHistory();
    let history = [];

    try {
      history = JSON.parse(existingData.historyOfStudent?.historyy || '[]');
    } catch (e) {
      history = [];
    }

    // Add new history entry
    history.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...historyData
    });

    const mutation = gql`
      mutation UpdateStudentHistory {
        updateHistoryOfStudent(
          where: { id: "cm9pokhh22uni07ob8f96d1b9" }
          data: { historyy: ${JSON.stringify(JSON.stringify(history))} }
        ) {
          id
        }
        publishHistoryOfStudent(where: { id: "cm9pokhh22uni07ob8f96d1b9" }) {
          id
        }
      }
    `;

    return await request(MASTER_URL, mutation);
  } catch (error) {
    console.error('Error saving student history:', error);
    throw error;
  }
};

const getWhatsAppData = async () => {
  const query = gql`
    query MyQuery {
      whatsappdata(where: {id: "cm9psso2z2wyd08o9lmwg3xev"}) {
        id
        whatsappnumber
      }
    }
  `;

  const result = await request(MASTER_URL, query);

  try {
    if (result?.whatsappdata?.whatsappnumber) {
      const decryptedText = decrypt(result.whatsappdata.whatsappnumber);
      const numbers = JSON.parse(decryptedText || '[]');
      return { ...result, whatsappdata: { ...result.whatsappdata, whatsappnumber: numbers } };
    }
  } catch (e) {
    console.error('Error decrypting WhatsApp data:', e);
  }

  return { ...result, whatsappdata: { ...result.whatsappdata, whatsappnumber: [] } };
};

const saveWhatsAppData = async (userData) => {
  try {
    const existingData = await getWhatsAppData();
    let whatsappNumbers = existingData?.whatsappdata?.whatsappnumber || [];

    if (!Array.isArray(whatsappNumbers)) {
      whatsappNumbers = [];
    }

    const newData = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userEmail: userData.email,
      studentWhatsApp: userData.studentPhone,
      parentWhatsApp: userData.parentPhone,
      createdAt: new Date().toISOString()
    };

    // Find existing user entry
    const existingIndex = whatsappNumbers.findIndex(entry => entry.userEmail === userData.email);

    if (existingIndex !== -1) {
      // Update existing entry
      whatsappNumbers[existingIndex] = {
        ...whatsappNumbers[existingIndex],
        ...newData,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new entry
      whatsappNumbers.push(newData);
    }

    // Encrypt the array
    const encryptedArray = encryptArray(whatsappNumbers);

    const mutation = gql`
      mutation UpdateWhatsAppData {
        updateWhatsappdata(
          where: { id: "cm9psso2z2wyd08o9lmwg3xev" }
          data: { whatsappnumber: "${encryptedArray}" }
        ) {
          id
        }
        publishWhatsappdata(where: { id: "cm9psso2z2wyd08o9lmwg3xev" }) {
          id
        }
      }
    `;

    return await request(MASTER_URL, mutation);
  } catch (error) {
    console.error('Error saving WhatsApp data:', error);
    throw error;
  }
};

export default {
  addChaptersForCourse,
  addManualActivation,
  addQuiz,
  checkUserEnrollment,
  createBookOrder,
  createClassCourse,
  createCourse,
  createNotification,
  deleteActivation,
  deleteNotification,
  getAllCourseList,
  getAllExams,
  getActivationData,
  getBooks,
  getBookOrders,
  getChaptersData,
  getClassCourses,
  getcourseinfo,
  getExamOrder,
  getNotifications,
  getOffer,
  getPaymentLogs,
  getQuizById,
  getQuizJsonResult,
  getQuizResults,
  getStudentHistory,
  getWhatsAppData,
  initializeChapterData,
  publishEnrolls,
  saveBookOrder,
  saveBooks,
  saveNewActivation,
  SaveGradesOfQuiz,
  saveStudentHistory,
  saveWhatsAppData,
  sendExamData,
  sendquiz,
  updateActivationData,
  updateActivationStatus,
  updateAllCourses,
  updateBookOrders,
  updateChaptersData,
  updateClassCourses,
  updateCourse,
  updateCourseChapters,
  updateCourseClass,
  updateCourseExams,
  updateExam,
  updateExamOrder,
  updateNotification,
  updateOffer,

}