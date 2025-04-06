import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, HeadingLevel, AlignmentType } from 'docx';

const DailyReportGenerator = () => {
  const [formData, setFormData] = useState({
    date: '',
    preparedBy: '',
    assignedBy: '',
    role: '',
    project: '',
    morningTasks: '',
    pendingTasks: '',
    blockers: '',
    meetings: '',
    completedTasks: '',
    pendingTasksEvening: '',
    challenges: '',
    tomorrowPlan: ''
  });

  const [activeTab, setActiveTab] = useState('basicInfo');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const generateDocument = () => {
    // Create lists with proper formatting
    const morningTasksList = formData.morningTasks
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph({
        children: [new TextRun({ text: "• ", bold: true }), new TextRun(item)]
      }));

    const pendingTasksList = formData.pendingTasks
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph({
        children: [new TextRun({ text: "• ", bold: true }), new TextRun(item)]
      }));

    const blockersList = formData.blockers
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph({
        children: [new TextRun({ text: "• ", bold: true }), new TextRun(item)]
      }));

    const meetingsList = formData.meetings
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph({
        children: [new TextRun({ text: "• ", bold: true }), new TextRun(item)]
      }));

    const completedTasksList = formData.completedTasks
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph({
        children: [new TextRun({ text: "• ", bold: true }), new TextRun(item)]
      }));

    const pendingTasksEveningList = formData.pendingTasksEvening
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph({
        children: [new TextRun({ text: "• ", bold: true }), new TextRun(item)]
      }));

    const challengesList = formData.challenges
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph({
        children: [new TextRun({ text: "• ", bold: true }), new TextRun(item)]
      }));

    const tomorrowPlanList = formData.tomorrowPlan
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph({
        children: [new TextRun({ text: "• ", bold: true }), new TextRun(item)]
      }));

    // Create the document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header with Title
          new Paragraph({
            
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Individual Daily Report",
                size: 36,
                bold: true,
                color: "2B5797"
              })
            ]
          }),
          new Paragraph(""),

          // Basic Information Section
          new Paragraph({
            children: [
              new TextRun({ text: "Date: ", bold: true, size: 24 }),
              new TextRun({ text: formData.date, size: 24 })
            ]
          }),
          new Paragraph(""),
          new Paragraph({
            children: [
              new TextRun({ text: "Prepared By: ", bold: true, size: 24 }),
              new TextRun({ text: formData.preparedBy, size: 24 })
            ]
          }),
          new Paragraph(""),
          new Paragraph({
            children: [
              new TextRun({ text: "Assigned By: ", bold: true, size: 24 }),
              new TextRun({ text: formData.assignedBy, size: 24 })
            ]
          }),
          new Paragraph(""),
          new Paragraph({
            children: [
              new TextRun({ text: "Role: ", bold: true, size: 24 }),
              new TextRun({ text: formData.role, size: 24 })
            ]
          }),
          new Paragraph(""),
          new Paragraph({
            children: [
              new TextRun({ text: "Project Involved: ", bold: true, size: 24 }),
              new TextRun({ text: formData.project, size: 24 })
            ]
          }),
          new Paragraph(""),

          // Morning Report Section
          new Paragraph({
            children: [
              new TextRun({ 
                text: "Morning Report", 
                bold: true, 
                size: 28,
                color: "2B5797",
                underline: {}
              })
            ]
          }),
          new Paragraph(""),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Tasks Planned for Today:", bold: true, size: 24 })
            ]
          }),
          ...(morningTasksList.length > 0 ? morningTasksList : [new Paragraph({ text: "• N/A" })]),
          new Paragraph(""),

          new Paragraph({
            children: [
              new TextRun({ text: "Pending Tasks from Previous Day:", bold: true, size: 24 })
            ]
          }),
          ...(pendingTasksList.length > 0 ? pendingTasksList : [new Paragraph({ text: "• N/A" })]),
          new Paragraph(""),

          new Paragraph({
            children: [
              new TextRun({ text: "Blockers or Support Needed:", bold: true, size: 24 })
            ]
          }),
          ...(blockersList.length > 0 ? blockersList : [new Paragraph({ text: "• N/A" })]),
          new Paragraph(""),

          new Paragraph({
            children: [
              new TextRun({ text: "Meetings Scheduled for the Day:", bold: true, size: 24 })
            ]
          }),
          ...(meetingsList.length > 0 ? meetingsList : [new Paragraph({ text: "• N/A" })]),
          new Paragraph(""),

          // Evening Report Section
          new Paragraph({
            children: [
              new TextRun({ 
                text: "Evening Report", 
                bold: true, 
                size: 28,
                color: "2B5797",
                underline: {}
              })
            ]
          }),
          new Paragraph(""),

          new Paragraph({
            children: [
              new TextRun({ text: "Tasks Completed Today:", bold: true, size: 24 })
            ]
          }),
          ...(completedTasksList.length > 0 ? completedTasksList : [new Paragraph({ text: "• N/A" })]),
          new Paragraph(""),

          new Paragraph({
            children: [
              new TextRun({ text: "Pending Tasks & Reasons:", bold: true, size: 24 })
            ]
          }),
          ...(pendingTasksEveningList.length > 0 ? pendingTasksEveningList : [new Paragraph({ text: "• N/A" })]),
          new Paragraph(""),

          new Paragraph({
            children: [
              new TextRun({ text: "Challenges Faced:", bold: true, size: 24 })
            ]
          }),
          ...(challengesList.length > 0 ? challengesList : [new Paragraph({ text: "• N/A" })]),
          new Paragraph(""),

          new Paragraph({
            children: [
              new TextRun({ text: "Plan for Tomorrow:", bold: true, size: 24 })
            ]
          }),
          ...(tomorrowPlanList.length > 0 ? tomorrowPlanList : [new Paragraph({ text: "• N/A" })]),
          new Paragraph(""),
        ]
      }]
    });

    // Generate and save document
    Packer.toBlob(doc).then((blob) => {
      const filename = `${formData.preparedBy}_DailyReport_${formData.date.replace(/-/g, '')}.docx`;
      saveAs(blob, filename);
    });
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'basicInfo':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-indigo-800 font-medium mb-1">Date*</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-indigo-800 font-medium mb-1">Prepared By*</label>
                <input
                  type="text"
                  name="preparedBy"
                  value={formData.preparedBy}
                  onChange={handleChange}
                  className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div>
                <label className="block text-indigo-800 font-medium mb-1">Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your Position/Role"
                />
              </div>
              <div>
                <label className="block text-indigo-800 font-medium mb-1">Assigned By*</label>
                <input
                  type="text"
                  name="assignedBy"
                  value={formData.assignedBy}
                  onChange={handleChange}
                  className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Manager Name [Position]"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-indigo-800 font-medium mb-1">Project Involved*</label>
              <input
                type="text"
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Project Name"
                required
              />
            </div>
          </div>
        );
      case 'morningReport':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-indigo-800 font-medium mb-1">Tasks Planned for Today* (one per line)</label>
              <textarea
                name="morningTasks"
                value={formData.morningTasks}
                onChange={handleChange}
                rows="4"
                placeholder="Create AI Based Market Research and Trend Analyzer"
                className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-indigo-800 font-medium mb-1">Pending Tasks from Previous Day (one per line)</label>
              <textarea
                name="pendingTasks"
                value={formData.pendingTasks}
                onChange={handleChange}
                rows="3"
                placeholder="N/A"
                className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
            <div>
              <label className="block text-indigo-800 font-medium mb-1">Blockers or Support Needed (one per line)</label>
              <textarea
                name="blockers"
                value={formData.blockers}
                onChange={handleChange}
                rows="3"
                placeholder="N/A"
                className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
            <div>
              <label className="block text-indigo-800 font-medium mb-1">Meetings Scheduled for the Day (one per line)</label>
              <textarea
                name="meetings"
                value={formData.meetings}
                onChange={handleChange}
                rows="3"
                placeholder="No scheduled meetings as of now."
                className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
          </div>
        );
      case 'eveningReport':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-indigo-800 font-medium mb-1">Tasks Completed Today* (one per line)</label>
              <textarea
                name="completedTasks"
                value={formData.completedTasks}
                onChange={handleChange}
                rows="4"
                placeholder="Completed AI Based Market Research and Trend Analyzer the Sample Chat bot on that Topic"
                className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-indigo-800 font-medium mb-1">Pending Tasks & Reasons (one per line)</label>
              <textarea
                name="pendingTasksEvening"
                value={formData.pendingTasksEvening}
                onChange={handleChange}
                rows="3"
                placeholder="N/A"
                className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
            <div>
              <label className="block text-indigo-800 font-medium mb-1">Challenges Faced (one per line)</label>
              <textarea
                name="challenges"
                value={formData.challenges}
                onChange={handleChange}
                rows="3"
                placeholder="N/A"
                className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
            <div>
              <label className="block text-indigo-800 font-medium mb-1">Plan for Tomorrow (one per line)</label>
              <textarea
                name="tomorrowPlan"
                value={formData.tomorrowPlan}
                onChange={handleChange}
                rows="3"
                placeholder="N/A"
                className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
          </div>
        );
      case 'preview':
        return (
          <div className="space-y-6 bg-white p-6 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-indigo-800">Individual Daily Report</h1>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div><span className="font-bold">Date:</span> {formData.date || '[Date]'}</div>
              <div><span className="font-bold">Prepared By:</span> {formData.preparedBy || '[Your Name]'}</div>
              <div><span className="font-bold">Role:</span> {formData.role || '[Your Role]'}</div>
              <div><span className="font-bold">Assigned By:</span> {formData.assignedBy || '[Manager Name]'}</div>
              <div><span className="font-bold">Project Involved:</span> {formData.project || '[Project Name]'}</div>
            </div>

            <div className="mt-4">
              <h2 className="text-xl font-bold text-indigo-800 border-b border-indigo-300 pb-1">Morning Report</h2>
              
              <h3 className="text-lg font-semibold mt-3">Tasks Planned for Today:</h3>
              {formData.morningTasks ? (
                <ul className="list-disc pl-5">
                  {formData.morningTasks.split('\n').filter(item => item.trim()).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : <p className="pl-5">• N/A</p>}

              <h3 className="text-lg font-semibold mt-3">Pending Tasks from Previous Day:</h3>
              {formData.pendingTasks ? (
                <ul className="list-disc pl-5">
                  {formData.pendingTasks.split('\n').filter(item => item.trim()).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : <p className="pl-5">• N/A</p>}

              <h3 className="text-lg font-semibold mt-3">Blockers or Support Needed:</h3>
              {formData.blockers ? (
                <ul className="list-disc pl-5">
                  {formData.blockers.split('\n').filter(item => item.trim()).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : <p className="pl-5">• N/A</p>}

              <h3 className="text-lg font-semibold mt-3">Meetings Scheduled for the Day:</h3>
              {formData.meetings ? (
                <ul className="list-disc pl-5">
                  {formData.meetings.split('\n').filter(item => item.trim()).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : <p className="pl-5">• No scheduled meetings as of now.</p>}
            </div>

            <div className="mt-4">
              <h2 className="text-xl font-bold text-indigo-800 border-b border-indigo-300 pb-1">Evening Report</h2>
              
              <h3 className="text-lg font-semibold mt-3">Tasks Completed Today:</h3>
              {formData.completedTasks ? (
                <ul className="list-disc pl-5">
                  {formData.completedTasks.split('\n').filter(item => item.trim()).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : <p className="pl-5">• N/A</p>}

              <h3 className="text-lg font-semibold mt-3">Pending Tasks & Reasons:</h3>
              {formData.pendingTasksEvening ? (
                <ul className="list-disc pl-5">
                  {formData.pendingTasksEvening.split('\n').filter(item => item.trim()).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : <p className="pl-5">• N/A</p>}

              <h3 className="text-lg font-semibold mt-3">Challenges Faced:</h3>
              {formData.challenges ? (
                <ul className="list-disc pl-5">
                  {formData.challenges.split('\n').filter(item => item.trim()).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : <p className="pl-5">• N/A</p>}

              <h3 className="text-lg font-semibold mt-3">Plan for Tomorrow:</h3>
              {formData.tomorrowPlan ? (
                <ul className="list-disc pl-5">
                  {formData.tomorrowPlan.split('\n').filter(item => item.trim()).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : <p className="pl-5">• N/A</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Function to load an example report
  const loadExample = () => {
    setFormData({
      date: '2025-04-02',
      preparedBy: 'Sanjay N',
      assignedBy: 'Prince Stanly [Project Manager]',
      role: 'Developer',
      project: 'AI Based Market Research and Trend Analyzer',
      morningTasks: 'Create AI Based Market Research and Trend Analyzer',
      pendingTasks: 'N/A',
      blockers: 'N/A',
      meetings: 'No scheduled meetings as of now.',
      completedTasks: 'Completed AI Based Market Research and Trend Analyzer the Sample Chat bot on that Topic',
      pendingTasksEvening: 'N/A',
      challenges: 'N/A',
      tomorrowPlan: 'N/A'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">Daily Report Generator</h1>
              <div className="flex gap-4">
                <button 
                  onClick={loadExample}
                  className="bg-white bg-opacity-20 px-4 py-2 rounded-lg text-blue-600 hover:bg-opacity-30 transition-all text-lg"
                >
                  Load Example
                </button>
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg text-blue-600 text-lg">
                  {formData.preparedBy || 'Individual Report'}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Tabs */}
          <div className="bg-indigo-50 border-b border-indigo-100">
            <div className="flex overflow-x-auto">
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'basicInfo' ? 'text-indigo-800 border-b-2 border-indigo-600 bg-white' : 'text-indigo-600 hover:bg-indigo-100'}`}
                onClick={() => setActiveTab('basicInfo')}
              >
                1. Basic Information
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'morningReport' ? 'text-indigo-800 border-b-2 border-indigo-600 bg-white' : 'text-indigo-600 hover:bg-indigo-100'}`}
                onClick={() => setActiveTab('morningReport')}
              >
                2. Morning Report
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'eveningReport' ? 'text-indigo-800 border-b-2 border-indigo-600 bg-white' : 'text-indigo-600 hover:bg-indigo-100'}`}
                onClick={() => setActiveTab('eveningReport')}
              >
                3. Evening Report
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'preview' ? 'text-indigo-800 border-b-2 border-indigo-600 bg-white' : 'text-indigo-600 hover:bg-indigo-100'}`}
                onClick={() => setActiveTab('preview')}
              >
                4. Preview
              </button>
            </div>
          </div>

          <div className="p-6">
            <form className="space-y-6">
              {renderTabContent()}

              {/* Navigation and Generate Buttons */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <div>
                  {activeTab !== 'basicInfo' &&
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['basicInfo', 'morningReport', 'eveningReport', 'preview'];
                        const currentIndex = tabs.indexOf(activeTab);
                        setActiveTab(tabs[currentIndex - 1]);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                      Previous
                    </button>
                  }
                </div>

                <div className="flex gap-3">
                  {activeTab !== 'preview' ?
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['basicInfo', 'morningReport', 'eveningReport', 'preview'];
                        const currentIndex = tabs.indexOf(activeTab);
                        setActiveTab(tabs[currentIndex + 1]);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Next
                    </button>
                    :
                    <button
                      type="button"
                      onClick={generateDocument}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                    >
                      <span>Generate DOCX</span>
                    </button>
                  }
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReportGenerator;